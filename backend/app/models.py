from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Car(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    name: str


class Run(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    car_id: int = Field(foreign_key="car.id")
    player_name: str
    coins: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
