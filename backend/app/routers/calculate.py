from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.schemas import CalculateRequest
from app.services.estimate import calculate, load_pricing

router = APIRouter(tags=["calculate"])


@router.post("/calculate")
def calculate_smeta(data: CalculateRequest, s: Settings = Depends(get_settings)):
    return calculate(data.rooms, load_pricing(s.pricing_file))
