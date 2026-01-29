from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .routes import router

# --- Lifespan für Startup / Shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

# --- FastAPI App ---
app = FastAPI(title="Speedrun Leaderboard API", lifespan=lifespan)

# --- CORS Middleware (MUSS VOR den Routes kommen!) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporär alle Origins erlauben
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Root-Endpunkt ---
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "Speedrun Leaderboard API sollte laufen!"}

# --- API-Router einbinden ---
app.include_router(router)