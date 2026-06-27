from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings


# ---------------------------------------------------------------------------
# Render provides DATABASE_URL starting with "postgres://…" but SQLAlchemy 2.x
# requires "postgresql://…".  Fix it automatically.
# ---------------------------------------------------------------------------
_url = settings.DATABASE_URL
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql://", 1)

# PostgreSQL connection-pool settings (ignored when using SQLite locally).
_pool_kwargs = {}
if _url.startswith("postgresql"):
    _pool_kwargs = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,       # Detect stale connections
        "pool_recycle": 1800,        # Recycle connections every 30 min
    }

engine = create_engine(
    _url,
    echo=False,
    **_pool_kwargs,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()