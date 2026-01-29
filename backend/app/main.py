from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .routes import router

# --- Lifespan-Funktion für Startup / Shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: DB erstellen
    create_db_and_tables()
    yield
    # Hier könnte man Shutdown-Logik einfügen, falls nötig

# --- FastAPI App ---
app = FastAPI(title="Speedrun Leaderboard API", lifespan=lifespan)

# --- Root-Endpunkt für Test / Browser ---
@app.get("/")
def root():
    return {"message": "Speedrun Leaderboard API läuft!"}

# --- CORS Middleware (für GitHub Pages Frontend) ---
origins = [
    "https://dein-frontend.github.io",  # <-- deine GitHub Pages URL
    "http://127.0.0.1:5500",            # <-- lokal testen, z.B. Live Server
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
