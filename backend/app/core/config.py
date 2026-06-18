from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):

    PROJECT_NAME: str = "TeenVerse"

    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str

    SECRET_KEY: str

    ADMIN_NAME: str | None = None
    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None

    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_API_BASE_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    OPENROUTER_MODEL: str = "openai/gpt-oss-120b"
    OPENROUTER_HTTP_REFERER: str = "http://localhost:3000"
    OPENROUTER_APP_TITLE: str = "TeenVerse"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = BASE_DIR / ".env"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
