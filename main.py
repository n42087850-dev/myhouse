from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Надежная настройка CORS, чтобы браузер не блокировал сетевые запросы
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Модель для элемента работы или материала
class Item(BaseModel):
    n: str  # Название
    p: float  # Цена
    u: str  # Тип площади (f - пол, w - стены)

# 2. Модель для параметров одной комнаты
class RoomReq(BaseModel):
    w: float  # Ширина
    l: float  # Длина
    h: float  # Высота
    o: float  # Окна и двери (m²)
    works: List[Item]  # Список работ для этой комнаты

# 3. Главная модель запроса (соответствует объекту { rooms: rooms } во фронтенде)
class CalculateRequest(BaseModel):
    rooms: List[RoomReq]

@app.post("/calculate")
async def calculate(request: CalculateRequest):
    total_work = 0
    materials_summary = []

    # Разворачиваем список комнат из объекта request
    for r in request.rooms:
        f_area = r.w * r.l
        w_area = (2 * (r.w + r.l) * r.h) - r.o
        
        for item in r.works:
            area = f_area if item.u == "f" else w_area
            cost = item.p * area
            total_work += cost
            
            # Собираем данные для итоговой сводки материалов
            materials_summary.append({
                "name": item.n,
                "amount": round(area, 2),
                "unit": "m2"
            })

    return {
        "total_work_cost": round(total_work),
        "materials_list": materials_summary,
        "status": "success"
    }

   
