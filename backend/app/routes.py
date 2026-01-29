from fastapi import APIRouter, HTTPException
from sqlmodel import select

from .database import get_session
from .models import Car, Run
from .schemas import RunCreate, RunResponse, LeaderboardResponse
from .auth import verify_password
from .leaderboard import enforce_top_5

router = APIRouter()

@router.post("/runs", response_model=RunResponse)
def submit_run(data: RunCreate):
    if not verify_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    with get_session() as session:
        car = session.exec(
            select(Car).where(Car.key == data.car_key)
        ).first()

        if not car:
            raise HTTPException(status_code=404, detail="Unknown car")

        run = Run(
            car_id=car.id,
            player_name=data.player_name,
            coins=data.coins
        )

        session.add(run)
        session.commit()
        session.refresh(run)

        enforce_top_5(session, car.id)

        runs = session.exec(
            select(Run).where(Run.car_id == car.id)
        ).all()

        runs.sort(key=lambda r: (-r.coins, r.created_at))
        rank = runs.index(run) + 1

        return {
            "status": "ok",
            "rank": rank,
            "car": car.key
        }


@router.get("/leaderboard/{car_key}", response_model=LeaderboardResponse)
def get_leaderboard(car_key: str):
    with get_session() as session:
        car = session.exec(
            select(Car).where(Car.key == car_key)
        ).first()

        if not car:
            raise HTTPException(status_code=404, detail="Unknown car")

        runs = session.exec(
            select(Run).where(Run.car_id == car.id)
        ).all()

        runs.sort(key=lambda r: (-r.coins, r.created_at))

        return {
            "car": car.key,
            "runs": [
                {
                    "rank": i + 1,
                    "player": r.player_name,
                    "coins": r.coins
                }
                for i, r in enumerate(runs)
            ]
        }


# Neuer Endpoint für Gesamtübersicht
@router.get("/leaderboard/all/records", response_model=list)
def get_all_records():
    """Gibt für jedes Auto den besten Run zurück"""
    with get_session() as session:
        # Hole alle Autos
        cars = session.exec(select(Car)).all()

        records = []

        for car in cars:
            # Hole den besten Run für dieses Auto
            best_run = session.exec(
                select(Run)
                .where(Run.car_id == car.id)
                .order_by(Run.coins.desc(), Run.created_at)
                .limit(1)
            ).first()

            if best_run:
                records.append({
                    "car_key": car.key,
                    "car_name": car.name,
                    "player": best_run.player_name,
                    "coins": best_run.coins
                })
            else:
                # Kein Run für dieses Auto
                records.append({
                    "car_key": car.key,
                    "car_name": car.name,
                    "player": "-",
                    "coins": 0
                })

        # Sortiere nach Coins absteigend
        records.sort(key=lambda x: -x["coins"])

        return records