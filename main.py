from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Item(BaseModel):
    n: str # Название
    p: float # Цена
    u: str # Тип площади (f - пол, w - стены)

class RoomReq(BaseModel):
    w: float
    l: float
    h: float
    o: float
    works: List[Item] # Список работ и материалов
@app.post("/calculate")
async def calculate(rooms: List[RoomReq]):
    total_work = 0
    materials_summary = []

    for r in rooms:
        f_area = r.w * r.l
        w_area = (2 * (r.w + r.l) * r.h) - r.o
        
        for item in r.works:
            area = f_area if item.u == "f" else w_area
            cost = item.p * area
            total_work += cost
            
            # Собираем данные для сводки материалов (пример логики)
            materials_summary.append({
                "name": item.n,
                "amount": round(area, 2),
                "unit": "m2"
            })

    return {
        "total_work_cost": round(total_work),
        "materials_list": materials_summary, # Список для первого блока
        "status": "success"
    }
