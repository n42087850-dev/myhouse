from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional
import os

app = FastAPI(title="MYHOUSE Full Engine V3.2")

# Разрешаем CORS (критично для GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение картинок
script_dir = os.path.dirname(__file__)
images_path = os.path.join(script_dir, "images")
if os.path.exists(images_path):
    app.mount("/images", StaticFiles(directory=images_path), name="images")

# --- КОНФИГУРАЦИЯ СТИЛЕЙ ---
STYLE_CONFIG = {
    "japandi": {"floor": "Светлое дерево", "wall": "Матовая эмульсия"},
    "loft": {"floor": "Бетон / Темный ламинат", "wall": "Кирпич / Декоративный бетон"},
    "minimal": {"floor": "Светлый ламинат", "wall": "Белая краска"},
    "neoclassic": {"floor": "Паркет елочкой", "wall": "Обои с молдингами"},
    "ethnic_modern": {"floor": "Натуральное дерево", "wall": "Текстурная штукатурка"}
}

class Room(BaseModel):
    type: str  # living_room, bedroom, kitchen, bathroom, toilet, corridor
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
    MARGIN = 1.1  # Запас 10%
    
    for room in data.rooms:
        # 1. Расчет площадей
        f_area = room.width * room.length
        perimeter = 2 * (room.width + room.length)
        w_area = (perimeter * room.height) - room.openings_area
        if w_area < 0: w_area = 0

        # 2. Подбор стиля для конкретной комнаты
        style_key = room.style.lower() if room.style else "minimal"
        selected_style = STYLE_CONFIG.get(style_key, STYLE_CONFIG["minimal"])

        # 3. Материалы (Объемы)
        # ВАЖНО: Название "Sement" латиницей, чтобы фронтенд поймал фикс мешков
        materials = [
            {"name": f"Pol qoplamasi ({selected_style['floor']})", "quantity": round(f_area * MARGIN, 1), "unit": "m2"},
            {"name": f"Devor pardozi ({selected_style['wall']})", "quantity": round(w_area * MARGIN, 1), "unit": "m2"},
            {"name": "Sement M-400 (черновой)", "quantity": round(f_area * 15 * MARGIN), "unit": "kg"},
            {"name": "Shpatlevka (finish)", "quantity": round(w_area * 1.2 * MARGIN), "unit": "kg"},
            {"name": "Gruntovka", "quantity": round((f_area + w_area) * 0.3, 1), "unit": "l"}
        ]

        detailed_rooms.append({
            "room_type": room.type.replace("_", " ").capitalize(),
            "floor_area": f_area,
            "wall_area": w_area,
            "materials": materials
        })

    return {
        "status": "success",
        "details": detailed_rooms
    }

@app.get("/design/{room_type}/{style}")
def get_design(room_type: str, style: str):
    # Логика заглушки: если картинок нет, фронтенд покажет placeholder
    return {"image": f"images/{room_type}_{style}.jpg"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
