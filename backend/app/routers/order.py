from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import Settings, get_settings
from app.schemas import OrderRequest
from app.services.ratelimit import order_rate_limit
from app.services.telegram import TelegramClient, TelegramError

router = APIRouter(tags=["order"])


def get_telegram(request: Request) -> TelegramClient:
    return request.app.state.telegram


@router.post("/order", dependencies=[Depends(order_rate_limit)])
async def create_order(
    order: OrderRequest,
    s: Settings = Depends(get_settings),
    tg: TelegramClient = Depends(get_telegram),
):
    chat_id = s.crew_chat_id if order.kind == "crew" else s.telegram_chat_id

    if order.photo:
        # Rasm hajmi: base64 ~ 4/3 baravar katta
        if len(order.photo) * 3 // 4 > s.max_photo_bytes:
            raise HTTPException(status_code=413, detail="Photo too large")
        try:
            await tg.send_photo(
                chat_id, order.photo, f"📸 3D-Визуализация комнаты\n📞 Тел: {order.phone}"
            )
        except (TelegramError, ValueError):
            pass  # snapshot ixtiyoriy: matn baribir yuboriladi

    try:
        await tg.send_message(chat_id, order.text)
    except TelegramError:
        raise HTTPException(status_code=502, detail="Telegramga yuborib bo'lmadi") from None

    return {"status": "success", "message": "Buyurtma yuborildi"}
