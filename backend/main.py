from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="MYHOUSE Full Engine V2")

# Разрешаем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение папки с картинками
script_dir = os.path.dirname(__file__)
images_path = os.path.join(script_dir, "images")
if os.path.exists(images_path):
    app.mount("/images", StaticFiles(directory=images_path), name="images")

# --- АВТОМАТИЗАЦИЯ КАРТИНОК ---
ROOM_TYPES = ["living_room", "bedroom", "kitchen", "bathroom", "toilet"]
STYLES = ["japandi", "loft", "neoclassic", "minimal", "ethnic_modern"]

DESIGN_IMAGES = {
    room: {style: f"images/{room}_{style}.jpg" for style in STYLES}
    for room in ROOM_TYPES
}

# --- МОДЕЛИ ДАННЫХ ---
class Room(BaseModel):
    type: str
    width: float
    length: float
    height: float
    openings_area: float = 0  # Площадь окон и дверей для вычета

class CalculateRequest(BaseModel):
    rooms: List[Room]
    style: str
    master_rate: float # Единая ставка (детализация будет в описании)

# --- ЛОГИКА РАСЧЕТА ---
@app.post("/calculate")
def calculate(data: CalculateRequest):
    total_work_cost = 0
    detailed_rooms = []
    
    # Коэффициент запаса
    MARGIN = 1.1 

    for room in data.rooms:
        # 1. Площади
        floor_area = room.width * room.length
        ceiling_area = floor_area # Потолок равен полу
        perimeter = 2 * (room.width + room.length)
        # Стены с вычетом проемов
        wall_area_net = (perimeter * room.height) - room.openings_area
        
        # 2. Труд мастера (Суммарная площадь поверхностей)
        # Считаем работу по полу, потолку и чистым стенам
        total_surface = floor_area + ceiling_area + wall_area_net
        work_cost = total_surface * data.master_rate
        total_work_cost += work_cost

        # 3. Список материалов (Только материалы!)
        materials = [
            {"n": "Цемент М-400 (стяжка)", "q": round(floor_area * 18 * MARGIN), "u": "кг"},
            {"n": "Грунтовка глубокого проникновения", "q": round(total_surface * 0.3 * MARGIN, 1), "u": "л"},
            {"n": "Шпатлевка финишная", "q": round(wall_area_net * 1.2 * MARGIN), "u": "кг"},
            {"n": "Таркетт / Кафель (пол)", "q": round(floor_area * MARGIN, 1), "u": "кв.м"},
            {"n": "Краска / Обои (стены)", "q": round(wall_area_net * MARGIN, 1), "u": "кв.м"},
            {"n": "Гипсокартон (потолок)", "q": round(ceiling_area * MARGIN, 1), "u": "кв.м"}
        ]

        detailed_rooms.append({
            "type": room.type,
            "areas": {
                "floor": round(floor_area, 2),
                "ceiling": round(ceiling_area, 2),
                "walls": round(wall_area_net, 2)
            },
            "materials": materials
        })

    # Детализация работ (для вывода при клике на цену мастера)
    master_works_info = [
        "Стяжка пола и наливной пол",
        "Штукатурка и выравнивание стен",
        "Грунтовка и шпатлевка",
        "Поклейка обоев / Оттаченто / Эмульсия",
        "Монтаж гипсокартона",
        "Укладка напольного покрытия"
    ]

    return {
        "summary": {
            "total_work_cost": f"{round(total_work_cost):,}".replace(",", " ") + " UZS",
            "master_works_list": master_works_info
        },
        "details": detailed_rooms
    }

@app.get("/design/{room_type}/{style}")
def get_design(room_type: str, style: str):
    room_data = DESIGN_IMAGES.get(room_type, DESIGN_IMAGES["living_room"])
    img_url = room_data.get(style.lower(), room_data["minimal"])
    return {"image": img_url}