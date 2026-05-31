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
    id: str        # Например: "styajka", "oboi", "kafel-pol"
    name: str      # Название работы для вывода
    price: float   # Цена мастера за 1 м2 или м.п.
    unit_type: str # 'f' - пол, 'w' - стены, 'c' - потолок, 'p' - периметр

# 2. Модель для параметров комнат — ТЕПЕРЬ СТРОГО СОВПАДАЕТ С ФРОНТЕНДОМ (w, l, h, o)
class RoomDimensions(BaseModel):
    w: float  # Ширина
    l: float  # Длина
    h: float  # Высота
    o: float  # Окна и двери

# 3. Единая модель запроса (БЕЗ style и БЕЗ master_rate, так как фронтенд их не шлет)
class CalculateRequest(BaseModel):
    rooms: List[RoomDimensions]
    selected_works: List[WorkItem] 

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
        total_ceiling_area += f_area  
        total_perimeter += p_meter
        total_wall_area += w_area

    # Шаг 2: Считаем деньги и материалы на основе выбранных работ
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

        # Корректно подтягиваем объем для инженерии
        if item.id in ["elektro", "santexnika"]:
            current_volume = total_floor_area

        # Считаем стоимость работы мастера
        cost = item.price * current_volume
        total_work_cost += cost

        # ДИНАМИЧЕСКИЙ РАСЧЕТ МАТЕРИАЛОВ (+10% ZAPAS)
        if item.id == "styajka":
            weight = (current_volume * 22 * 5) * 1.10
            materials_summary.append({
                "name": "Цемент М-400 (Пескобетон) / Sement M-400",
                "amount": round(weight),
                "unit": "kg"
            })
        
        elif item.id == "nalivnoy":
            weight = (current_volume * 1.6 * 10) * 1.10
            materials_summary.append({
                "name": "Самовыравнивающийся наливной пол / Quyma pol aralashmasi",
                "amount": round(weight),
                "unit": "kg"
            })
            
        elif item.id == "laminat":
            materials_summary.append({
                "name": "Ламинат и подложка / Laminat va taglik (polizol)",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m²"
            })
            
        elif item.id == "kafel-pol":
            materials_summary.append({
                "name": "Кафельная плитка (пол) / Kafel (pol uchun)",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m²"
            })
            materials_summary.append({
                "name": "Плиточный клей (усиленный) / Plitka yelimi (kley)",
                "amount": round((current_volume * 4.5) * 1.10),
                "unit": "kg"
            })
            
        elif item.id == "issiq-pol":
            materials_summary.append({
                "name": "Маты и кабель тёплого пола / Issiq pol tizimi (matlar)",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m²"
            })
            
        elif item.id == "plintus":
            materials_summary.append({
                "name": "Плинтус и крепежи / Plintus va mahkamlagichlar",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m.p."
            })
            
        elif item.id == "shtukaturka":
            weight = (current_volume * 9 * 1.5) * 1.10
            materials_summary.append({
                "name": "Штукатурка гипсовая / Shpatlyovka (suvoq uchun)",
                "amount": round(weight),
                "unit": "kg"
            })
            
        elif item.id == "shpatlevka":
            weight = (current_volume * 1.2) * 1.10
            materials_summary.append({
                "name": "Шпатлевка финишная / Finish shpatlyovka",
                "amount": round(weight),
                "unit": "kg"
            })
            
        elif item.id == "oboi":
            materials_summary.append({
                "name": "Обои (чистовое покрытие) / Oboi",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m²"
            })
            materials_summary.append({
                "name": "Клей обойный / Oboi yelimi (kley)",
                "amount": round((current_volume * 0.05) * 1.10, 2),
                "unit": "kg"
            })
            
        elif item.id == "boyoq":
            liters = (current_volume * 0.3) * 1.10
            materials_summary.append({
                "name": "Краска интерьерная (2 слоя) / Ichki bo'yoq",
                "amount": round(liters, 2),
                "unit": "l"
            })
            
        elif item.id == "travertin":
            weight = (current_volume * 2.5) * 1.10
            materials_summary.append({
                "name": "Декоративный травертин / Dekorativ travertin (mineral)",
                "amount": round(weight),
                "unit": "kg"
            })
            
        elif item.id == "natyajnoy":
            materials_summary.append({
                "name": "Натяжное ПВХ полотно и багет / Natyajnoy potolok plyonkasi",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m²"
            })
            
        elif item.id == "gipsokarton":
            materials_summary.append({
                "name": "Листы гипсокартона (ГКЛ) / Gipsokarton varaqlari",
                "amount": round(current_volume * 1.10, 2),
                "unit": "m²"
            })
            materials_summary.append({
                "name": "Профиль металлический (CD/UD) / Metall profil",
                "amount": round((current_volume * 2.2) * 1.10, 2),
                "unit": "m.p."
            })
            
        elif item.id == "elektro":
            meters = (total_floor_area * 4.5) * 1.10
            materials_summary.append({
                "name": "Силовой кабель ВВГнг и гофра / Kuchlanish kabeli va gofra",
                "amount": round(meters, 2),
                "unit": "m.p."
            })
            
        elif item.id == "santexnika":
            meters = (total_floor_area * 1.2) * 1.10
            materials_summary.append({
                "name": "Трубы экопластик водопроводные (PPR) / Suv quvurlari (ekoplastik)",
                "amount": round(meters, 2),
                "unit": "m.p."
            })

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
