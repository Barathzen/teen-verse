from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

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

# Async engine and sessionmaker
_async_url = _url
if _async_url.startswith("postgresql://"):
    _async_url = _async_url.replace("postgresql://", "postgresql+asyncpg://", 1)

_async_pool_kwargs = {}
if _async_url.startswith("postgresql+asyncpg"):
    _async_pool_kwargs = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 1800,
    }

async_engine = create_async_engine(
    _async_url,
    echo=False,
    **_async_pool_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=async_engine,
    class_=AsyncSession,
)

Base = declarative_base()