import os

# Settings importdan oldin test qiymatlari
os.environ.setdefault("TELEGRAM_BOT_TOKEN", "123:TEST")
os.environ.setdefault("TELEGRAM_CHAT_ID", "-100111")
os.environ.setdefault("TELEGRAM_CREW_CHAT_ID", "-100222")

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.ratelimit import limiter


class FakeTelegram:
    def __init__(self):
        self.messages, self.photos = [], []

    async def send_message(self, chat_id, text):
        self.messages.append((chat_id, text))

    async def send_photo(self, chat_id, data_url, caption):
        self.photos.append((chat_id, caption))

    async def aclose(self):
        pass


@pytest.fixture
def tg():
    return FakeTelegram()


@pytest.fixture
def client(tg):
    limiter.reset()
    app = create_app()
    with TestClient(app) as c:
        app.state.telegram = tg  # lifespan dan keyin fake qo'yamiz
        yield c
