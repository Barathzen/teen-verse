import sys
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import _pool_kwargs

_url = settings.DATABASE_URL
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql://", 1)

engine = create_engine(_url, **_pool_kwargs)
with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE simulations ADD COLUMN ripple_story VARCHAR DEFAULT '';"))
        print("Successfully added ripple_story column.")
    except Exception as e:
        print(f"Error adding column: {e}")
