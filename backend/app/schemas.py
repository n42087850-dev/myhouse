import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

RoomType = Literal["bedroom", "living_room", "kitchen", "bathroom", "toilet", "child", "hallway"]
Style = Literal["ethnic_modern", "japandi", "minimal", "neoclassic", "loft"]

OrderKind = Literal[
    "single_estimate", "all_estimates", "detailed_order", "custom_order", "zamer_order", "crew"
]

_DATA_URL = re.compile(r"^data:image/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$")


class RoomData(BaseModel):
    room_type: RoomType
    style: Style | None = None
    length: float = Field(gt=0, le=100)
    width: float = Field(gt=0, le=100)
    height: float = Field(gt=0, le=10)
    openings: float = Field(default=0, ge=0, le=200)  # eshik/deraza maydoni, m2


class CalculateRequest(BaseModel):
    rooms: list[RoomData] = Field(min_length=1, max_length=30)


class OrderRequest(BaseModel):
    kind: OrderKind
    text: str = Field(min_length=1, max_length=20000)
    phone: str
    name: str | None = Field(default=None, max_length=100)
    photo: str | None = None  # data:image/png;base64,...

    @field_validator("phone")
    @classmethod
    def phone_ok(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if not 9 <= len(digits) <= 15:
            raise ValueError("telefon raqami noto'g'ri")
        return v.strip()

    @field_validator("photo")
    @classmethod
    def photo_ok(cls, v: str | None) -> str | None:
        if v is None:
            return None
        if not _DATA_URL.match(v):
            raise ValueError("photo data URL bo'lishi kerak (png/jpeg/webp)")
        return v
