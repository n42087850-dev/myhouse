from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import calculate, design, order
from app.services.telegram import TelegramClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    s = get_settings()
    app.state.telegram = TelegramClient(s.telegram_bot_token.get_secret_value())
    yield
    await app.state.telegram.aclose()


def create_app() -> FastAPI:
    app = FastAPI(title="MYHOUSE PRO API", version="2.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().origins,
        allow_credentials=False,  # cookie ishlatilmaydi
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    app.include_router(design.router)
    app.include_router(calculate.router)
    app.include_router(order.router)

    @app.get("/")
    @app.get("/health")
    def health():
        return {"status": "ok", "project": "MYHOUSE PRO API", "version": app.version}

    return app


app = create_app()
