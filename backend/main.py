from fastapi import FastAPI # Исправили 'From' на 'from'
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Добавили для картинок
from pydantic import BaseModel
from typing import List
import os # Добавили для работы с папками

app = FastAPI(title="MYHOUSE Full Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Вот этот блок позволит твоему сайту видеть картинки в интернете
script_dir = os.path.dirname(__file__)
images_path = os.path.join(script_dir, "images")
if os.path.exists(images_path):
    app.mount("/images", StaticFiles(directory=images_path), name="images")

# Цены только на МАТЕРИАЛЫ (средние по рынку)
MAT_WALL = 180000      
MAT_FLOOR = 400000     
MAT_CEILING = 150000   

DESIGN_IMAGES = {
    "living_room": {
        "minimal": "images/living_room_minimal.jpg",
        "modern": "images/living_room_modern.jpg",
        "luxury": "images/living_room_luxury.jpg"
    },
    "bedroom": {
        "minimal": "images/bedroom_minimal.jpg",
        "modern": "images/bedroom_modern.jpg",
        "luxury": "images/bedroom_luxury.jpg"
    },
    "kitchen": {
        "minimal": "images/kitchen_minimal.jpg",
        "modern": "images/kitchen_modern.jpg",
        "luxury": "images/kitchen_luxury.jpg"
    },
    "bathroom": {
        "minimal": "images/bathroom_minimal.jpg",
        "modern": "images/bathroom_modern.jpg",
        "luxury": "images/bathroom_luxury.jpg"
    },
    "toilet": {
        "minimal": "images/toilet_minimal.jpg",
        "modern": "images/toilet_modern.jpg",
        "luxury": "images/toilet_luxury.jpg"
    }
}

class Room(BaseModel):
    type: str
    width: float
    length: float
    height: float

class CalculateRequest(BaseModel):
    rooms: List[Room]
    style: str
    master_rate: float # Цена мастера за м2

@app.post("/calculate")
def calculate(data: CalculateRequest):
    total_mat_cost = 0
    total_work_cost = 0
    detailed_rooms = []

    for room in data.rooms:
        f_area = room.width * room.length
        w_area = 2 * (room.width + room.length) * room.height
        
        # Стоимость материалов
        m_cost = (f_area * MAT_FLOOR) + (w_area * MAT_WALL) + (f_area * MAT_CEILING)
        total_mat_cost += m_cost
        
        # Стоимость работы мастера (площадь всех поверхностей * ставка)
        work_cost = (f_area + w_area + f_area) * data.master_rate
        total_work_cost += work_cost

        detailed_rooms.append({
            "type": room.type,
            "wall_m2": round(w_area, 2),
            "floor_m2": round(f_area, 2),
            "materials_list": [
                {"n": "Грунтовка", "q": round(w_area / 40, 1), "u": "канистр"},
                {"n": "Шпатлевка", "q": round(w_area / 12, 1), "u": "мешков"},
                {"n": "Стяжка", "q": round(f_area / 3, 1), "u": "мешков"},
                {"n": "Кафель/Таркетт", "q": round(f_area * 1.1, 1), "u": "кв.м"}
            ]
        })

    return {
        "mat_cost": round(total_mat_cost, 2),
        "work_cost": round(total_work_cost, 2),
        "details": detailed_rooms
    }

@app.get("/design/{room_type}/{style}")
def get_design(room_type: str, style: str):
    room_data = DESIGN_IMAGES.get(room_type, DESIGN_IMAGES["living_room"])
    img_url = room_data.get(style, room_data["modern"])
    return {"image": img_url}