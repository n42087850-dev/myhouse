from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings, get_settings
from app.schemas import RoomType, Style

router = APIRouter(tags=["design"])


@router.get("/design/{room_type}/{style}")
def design_preview(room_type: RoomType, style: Style, s: Settings = Depends(get_settings)):
    """Xona turi va uslubi bo'yicha render rasmi yo'lini qaytaradi (frontend/images/ ichida)."""
    name = f"{room_type}_{style}.jpg"
    if not (s.images_dir / name).is_file():
        raise HTTPException(status_code=404, detail="Render topilmadi")
    return {"room_type": room_type, "style": style, "image_url": f"images/{name}"}
