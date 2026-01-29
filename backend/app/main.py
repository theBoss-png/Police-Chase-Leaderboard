from fastapi import FastAPI
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="Speedrun Leaderboard API",
    lifespan=lifespan
)

# --- Root-Endpunkt ---
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "Speedrun Leaderboard API sollte laufen!"}

app.include_router(router)

