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
