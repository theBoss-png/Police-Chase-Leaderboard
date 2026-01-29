from fastapi import FastAPI
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .routes import router
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="Speedrun Leaderboard API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://theboss-png.github.io",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root-Endpunkt ---
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "Speedrun Leaderboard API sollte laufen!"}

app.include_router(router)

