from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Модель для работы/услуги с фронтенда
class WorkItem(BaseModel):
    id: str     # Например: "styajka", "oboi", "kafel-pol"
    name: str   # Название работы для вывода
    price: float # Цена мастера за 1 м2 или м.п.
    unit_type: str # 'f' - пол, 'w' - стены, 'c' - потолок, 'p' - периметр

# 2. Модель для параметров комнат (Страница 1)
class RoomDimensions(BaseModel):
    w: float  # Ширина
    l: float  # Длина
    h: float  # Высота
    o: float  # Окна и двери

# 3. Единая модель запроса
class CalculateRequest(BaseModel):
    rooms: List[RoomDimensions]
    selected_works: List[WorkItem] # Список только тех работ, где стоят галочки!

@app.post("/calculate")
async def calculate(request: CalculateRequest):
    # Шаг 1: Считаем суммарные объемы по ВСЕМ комнатам здания
    total_floor_area = 0.0
    total_wall_area = 0.0
    total_ceiling_area = 0.0
    total_perimeter = 0.0

    for r in request.rooms:
        f_area = r.w * r.l
        p_meter = 2 * (r.w + r.l)
        w_area = (p_meter * r.h) - r.o
        if w_area < 0: 
            w_area = 0

        total_floor_area += f_area
        total_ceiling_area += f_area  # Площадь потолка равна полу
        total_perimeter += p_meter
        total_wall_area += w_area

    # Шаг 2: Считаем деньги на основе выбранных работ
    total_work_cost = 0.0
    materials_summary = []

    for item in request.selected_works:
        # Привязываем правильный объем в зависимости от типа работы
        if item.unit_type == "f":
            current_volume = total_floor_area
        elif item.unit_type == "w":
            current_volume = total_wall_area
        elif item.unit_type == "c":
            current_volume = total_ceiling_area
        elif item.unit_type == "p":
            current_volume = total_perimeter
        else:
            current_volume = 0.0

        # Считаем стоимость работы
        cost = item.price * current_volume
        total_work_cost += cost

        # Сразу генерируем объемы материалов (чистые объемы без дублей)
        materials_summary.append({
            "name": item.name,
            "amount": round(current_volume, 2),
            "unit": "m" if item.unit_type == "p" else "m2"
        })

    # Возвращаем стоимость, материалы И рассчитанные площади для отображения
    return {
        "total_work_cost": round(total_work_cost),
        "materials_list": materials_summary,
        "calculated_volumes": {
            "total_floor_area": round(total_floor_area, 2),
            "total_wall_area": round(total_wall_area, 2),
            "total_ceiling_area": round(total_ceiling_area, 2),
            "total_perimeter": round(total_perimeter, 2)
        },
        "status": "success"
    }
