"""Sozlamalar faqat environment / .env dan o'qiladi. Kodda hech qanday maxfiy qiymat yo'q."""
from functools import lru_cache
from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    # Majburiy: bo'lmasa server ishga tushmaydi (default qiymat ataylab yo'q)
    telegram_bot_token: SecretStr
    telegram_chat_id: str
    telegram_crew_chat_id: str | None = None

    allowed_origins: str = "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080"

    rate_limit_max: int = 5
    rate_limit_window_sec: int = 600
    trust_proxy: bool = False

    max_photo_bytes: int = 5 * 1024 * 1024
    max_text_chars: int = 20000

    pricing_file: Path = BASE_DIR / "pricing.json"
    images_dir: Path = BASE_DIR.parent / "frontend" / "images"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def crew_chat_id(self) -> str:
        return self.telegram_crew_chat_id or self.telegram_chat_id


@lru_cache
def get_settings() -> Settings:
    return Settings()
