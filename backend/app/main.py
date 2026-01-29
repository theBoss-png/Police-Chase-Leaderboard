from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .routes import router

# --- Lifespan für Startup / Shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()  # DB beim Start erstellen
    yield

# --- FastAPI App ---
app = FastAPI(title="Speedrun Leaderboard API", lifespan=lifespan)

# --- Root-Endpunkt (GET + HEAD) ---
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "Speedrun Leaderboard API läuft!"}

# --- CORS Middleware ---
origins = [
    "https://theboss-png.github.io",  # GitHub Pages (ohne Pfad!)
    "http://127.0.0.1:5500",          # Live Server
    "http://localhost:5500",          # Live Server alternative
    "http://127.0.0.1:5501",          # Falls anderer Port
    "http://localhost:5501",
    "*"  # TEMPORÄR: Erlaubt alle Origins (zum Testen)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API-Router einbinden ---
app.include_router(router)