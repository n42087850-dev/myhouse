from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="MYHOUSE Full Engine V3.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ТВОИ ЦЕНЫ ЗА РАБОТУ (UZS)
WORK_PRICES = {
    "floor_base": 45000,    # Styajka
    "floor_finish": 35000,  # Laminat/Tarkett
    "wall_base": 65000,     # Shtukaturka + Shpatlevka
    "wall_finish": 20000,   # Oboi/Kraska
    "ceiling": 45000,       # Natyajnoy
    "engineering": 110000   # Electro + Santeh (na m2 pola)
}

STYLE_CONFIG = {
    "japandi": {"floor": "Och yog'och", "wall": "Matovaya emulsiya"},
    "loft": {"floor": "Beton / To'q laminat", "wall": "G'isht / Beton dekor"},
    "minimal": {"floor": "Och laminat", "wall": "Oq kraska"},
    "neoclassic": {"floor": "Parket", "wall": "Oboy + molding"},
    "ethnic_modern": {"floor": "Tabiiy yog'och", "wall": "Teksturali shtukaturka"}
}

class Room(BaseModel):
    type: str
    style: Optional[str] = "minimal"
    width: float
    length: float
    height: float
    openings_area: Optional[float] = 0

class CalculateRequest(BaseModel):
    rooms: List[Room]

@app.post("/calculate")
def calculate(data: CalculateRequest):
    detailed_rooms = []
    total_project_work_cost = 0
    MARGIN = 1.1

    for room in data.rooms:
        f_area = room.width * room.length
        perimeter = 2 * (room.width + room.length)
        w_area = (perimeter * room.height) - room.openings_area
        if w_area < 0: w_area = 0

        # РАСЧЕТ ТРУДА МАСТЕРА
        room_work = (
            f_area * (WORK_PRICES["floor_base"] + WORK_PRICES["floor_finish"]) +
            w_area * (WORK_PRICES["wall_base"] + WORK_PRICES["wall_finish"]) +
            f_area * WORK_PRICES["ceiling"] +
            f_area * WORK_PRICES["engineering"]
        )
        total_project_work_cost += room_work

        style_key = room.style.lower() if room.style else "minimal"
        selected_style = STYLE_CONFIG.get(style_key, STYLE_CONFIG["minimal"])

        detailed_rooms.append({
            "room_type": room.type.replace("_", " ").capitalize(),
            "work_cost_sum": round(room_work),
            "materials": [
                {"name": f"Pol ({selected_style['floor']})", "quantity": round(f_area * MARGIN, 1), "unit": "m2"},
                {"name": f"Devor ({selected_style['wall']})", "quantity": round(w_area * MARGIN, 1), "unit": "m2"},
                {"name": "Sement M-400", "quantity": round(f_area * 15 * MARGIN), "unit": "kg"},
                {"name": "Finish shpatlevka", "quantity": round(w_area * 1.2 * MARGIN), "unit": "kg"}
            ]
        })

    return {
        "status": "success",
        "total_cost": f"{round(total_project_work_cost):,}".replace(",", " "),
        "details": detailed_rooms
    }
