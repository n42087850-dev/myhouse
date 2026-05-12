from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict
import os

app = FastAPI(title="MYHOUSE Full Engine V3")

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

# --- 1. СПРАВОЧНИК СТОИМОСТИ РАБОТ (UZS за м2/м.п) ---
WORK_PRICES = {
    "floor": {
        "styajka": 45000,
        "nalivnoy": 30000,
        "tarkett_laminat": 35000,
        "parket": 80000,
        "kafel": 75000,
        "plintus": 15000  # за погонный метр
    },
    "walls": {
        "shtukaturka": 40000,
        "shpatlevka": 25000,
        "oboi": 20000,
        "pokraska": 25000,
        "kafel": 80000,
        "decor_shtukaturka": 60000
    },
    "ceiling": {
        "gipsokarton": 55000,
        "natyajnoy": 45000,
        "shpatlevka_pokraska": 40000
    },
    "engineering": {
        "electro": 60000, # на м2 пола
        "santehnika": 50000,
        "otoplenie": 45000
    }
}

# --- 2. ЛОГИКА СТИЛЕЙ (Для синхронизации с фото) ---
STYLE_CONFIG = {
    "japandi": {"floor": "Светлое дерево", "wall": "Матовая эмульсия"},
    "loft": {"floor": "Бетон / Темный ламинат", "wall": "Кирпич / Декоративный бетон"},
    "minimal": {"floor": "Светлый ламинат", "wall": "Белая краска"},
    "neoclassic": {"floor": "Паркет елочкой", "wall": "Обои с молдингами"},
    "ethnic_modern": {"floor": "Натуральное дерево", "wall": "Текстурная штукатурка"}
}

# --- 3. МОДЕЛИ ДАННЫХ ---
class Room(BaseModel):
    type: str  # living_room, bedroom, kitchen, bathroom, toilet
    width: float
    length: float
    height: float
    openings_area: float = 0

class CalculateRequest(BaseModel):
    rooms: List[Room]
    style: str

# --- 4. ВСПОМОГАТЕЛЬНАЯ ЛОГИКА ---
def get_room_images():
    room_types = ["living_room", "bedroom", "kitchen", "bathroom", "toilet"]
    styles = ["japandi", "loft", "neoclassic", "minimal", "ethnic_modern"]
    return {room: {style: f"images/{room}_{style}.jpg" for style in styles} for room in room_types}

DESIGN_IMAGES = get_room_images()

# --- 5. ОСНОВНОЙ ЭНДПОИНТ РАСЧЕТА ---
@app.post("/calculate")
def calculate(data: CalculateRequest):
    total_project_cost = 0
    detailed_rooms = []
    MARGIN = 1.1 # Запас 10%
    
    selected_style = STYLE_CONFIG.get(data.style.lower(), STYLE_CONFIG["minimal"])

    for room in data.rooms:
        # Авто-расчет площадей
        f_area = room.width * room.length
        perimeter = 2 * (room.width + room.length)
        w_area = (perimeter * room.height) - room.openings_area
        
        # Логика: Кафель только в мокрых зонах
        is_wet = room.type in ["bathroom", "toilet", "kitchen"]
        floor_finishing = WORK_PRICES["floor"]["kafel"] if is_wet else WORK_PRICES["floor"]["tarkett_laminat"]
        wall_finishing = WORK_PRICES["walls"]["kafel"] if is_wet else WORK_PRICES["walls"]["oboi"]

        # Сборка сметы для комнаты (Труд мастера)
        room_work_sum = (
            f_area * (WORK_PRICES["floor"]["styajka"] + floor_finishing) +
            perimeter * WORK_PRICES["floor"]["plintus"] +
            w_area * (WORK_PRICES["walls"]["shtukaturka"] + WORK_PRICES["walls"]["shpatlevka"] + wall_finishing) +
            f_area * WORK_PRICES["ceiling"]["natyajnoy"] +
            f_area * (WORK_PRICES["engineering"]["electro"] + WORK_PRICES["engineering"]["santehnika"])
        )
        
        total_project_cost += room_work_sum

        # Список материалов (Синхронизирован со стилем)
        materials = [
            {"name": f"Покрытие пола ({selected_style['floor']})", "quantity": round(f_area * MARGIN, 1), "unit": "м2"},
            {"name": f"Отделка стен ({selected_style['wall']})", "quantity": round(w_area * MARGIN, 1), "unit": "м2"},
            {"name": "Цемент М-400 (черновой)", "quantity": round(f_area * 15 * MARGIN), "unit": "кг"},
            {"name": "Шпатлевка финишная", "quantity": round(w_area * 1.2 * MARGIN), "unit": "кг"},
            {"name": "Грунтовка", "quantity": round((f_area + w_area) * 0.3, 1), "unit": "л"}
        ]

        detailed_rooms.append({
            "room_type": room.type,
            "calculated_areas": {
                "floor_m2": round(f_area, 2),
                "walls_m2": round(w_area, 2),
                "perimeter_m": round(perimeter, 2)
            },
            "work_cost": f"{round(room_work_sum):,}".replace(",", " "),
            "materials": materials
        })

    return {
        "status": "success",
        "style_info": {
            "name": data.style,
            "description": f"Расчет выполнен в стиле {data.style}. Визуализация соответствует выбранным материалам."
        },
        "summary": {
            "total_cost_uzs": f"{round(total_project_cost):,}".replace(",", " "),
            "works_included": [
                "Стяжка и наливной пол", "Штукатурка и шпатлевка", 
                "Чистовая отделка (пол/стены)", "Натяжной потолок", 
                "Электрика и Сантехника"
            ]
        },
        "details": detailed_rooms
    }

# --- 6. ЭНДПОИНТ ВИЗУАЛИЗАЦИИ ---
@app.get("/design/{room_type}/{style}")
def get_design(room_type: str, style: str):
    room_data = DESIGN_IMAGES.get(room_type, DESIGN_IMAGES["living_room"])
    img_url = room_data.get(style.lower(), room_data["minimal"])
    return {"image": img_url}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)