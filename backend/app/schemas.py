from pydantic import BaseModel

class RunCreate(BaseModel):
    password: str
    car_key: str
    player_name: str
    coins: int


class RunResponse(BaseModel):
    status: str
    rank: int
    car: str


class LeaderboardEntry(BaseModel):
    rank: int
    player: str
    coins: int


class LeaderboardResponse(BaseModel):
    car: str
    runs: list[LeaderboardEntry]
