from sqlmodel import select
from .models import Run
from sqlmodel import Session

def enforce_top_5(session: Session, car_id: int):
    runs = session.exec(
        select(Run).where(Run.car_id == car_id)
    ).all()

    runs.sort(key=lambda r: (-r.coins, r.created_at))

    for run in runs[5:]:
        session.delete(run)

    session.commit()
