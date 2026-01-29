import os
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "postgresql://postgres.ashfhhhrkvkkbfkbcxqi:zotqad-herfe0-Cefcej@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"#os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL,
    echo=True,          # zum Debuggen (kannst du später ausmachen)
    pool_pre_ping=True  # wichtig für Supabase
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)
