from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

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

# 2. Модель для параметров комнат
class RoomDimensions(BaseModel):
    w: float  # Ширина
    l: float  # Длина
    h: float  # Высота
    o: float  # Окна и двери

# 3. Единая модель запроса
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
    # Используем словарь для агрегации материалов, чтобы избежать дублирования названий
    materials_dict: Dict[str, Dict] = {}

    def add_material(name: str, amount: float, unit: str, should_round: bool = False):
        """Вспомогательная функция для безопасного добавления и суммирования материалов"""
        val = round(amount) if should_round else round(amount, 2)
        if name in materials_dict:
            materials_dict[name]["amount"] = round(materials_dict[name]["amount"] + val, 2)
        else:
            materials_dict[name] = {"name": name, "amount": val, "unit": unit}

    for item in request.selected_works:
        # Корректно подтягиваем объем в зависимости от типа или ID работы
        if item.id in ["elektro", "santexnika"]:
            current_volume = total_floor_area
        elif item.unit_type == "f":
            current_volume = total_floor_area
        elif item.unit_type == "w":
            current_volume = total_wall_area
        elif item.unit_type == "c":
            current_volume = total_ceiling_area
        elif item.unit_type == "p":
            current_volume = total_perimeter
        else:
            current_volume = 0.0

        # Считаем стоимость работы мастера
        cost = item.price * current_volume
        total_work_cost += cost

        # ДИНАМИЧЕСКИЙ РАСЧЕТ МАТЕРИАЛОВ (+10% ZAPAS)
        if item.id == "styajka":
            weight = (current_volume * 22 * 5) * 1.10
            add_material("Цемент М-400 (Пескобетон) / Sement M-400", weight, "kg", should_round=True)
        
        elif item.id == "nalivnoy":
            weight = (current_volume * 1.6 * 10) * 1.10
            add_material("Самовыравнивающийся наливной пол / Quyma pol aralashmasi", weight, "kg", should_round=True)
            
        elif item.id == "laminat":
            add_material("Ламинат и подложка / Laminat va taglik (polizol)", current_volume * 1.10, "m²")
            
        elif item.id == "kafel-pol":
            add_material("Кафельная плитка (пол) / Kafel (pol uchun)", current_volume * 1.10, "m²")
            weight = (current_volume * 4.5) * 1.10
            add_material("Плиточный клей (усиленный) / Plitka yelimi (kley)", weight, "kg", should_round=True)
            
        elif item.id == "issiq-pol":
            add_material("Маты и кабель тёплого пола / Issiq pol tizimi (matlar)", current_volume * 1.10, "m²")
            
        elif item.id == "plintus":
            add_material("Плинтус и крепежи / Plintus va mahkamlagichlar", current_volume * 1.10, "m.p.")
            
        elif item.id == "shtukaturka":
            weight = (current_volume * 9 * 1.5) * 1.10
            add_material("Штукатурка гипсовая / Shpatlyovka (suvoq uchun)", weight, "kg", should_round=True)
            
        elif item.id == "shpatlevka":
            weight = (current_volume * 1.2) * 1.10
            add_material("Шпатлевка финишная / Finish shpatlyovka", weight, "kg", should_round=True)
            
        elif item.id == "oboi":
            add_material("Обои (чистовое покрытие) / Oboi", current_volume * 1.10, "m²")
            weight = (current_volume * 0.05) * 1.10
            add_material("Клей обойный / Oboi yelimi (kley)", weight, "kg")
            
        elif item.id == "boyoq":
            liters = (current_volume * 0.3) * 1.10
            add_material("Краска интерьерная (2 слоя) / Ichki bo'yoq", liters, "l")
            
        elif item.id == "travertin":
            weight = (current_volume * 2.5) * 1.10
            add_material("Декоративный травертин / Dekorativ travertin (mineral)", weight, "kg", should_round=True)
            
        elif item.id == "natyajnoy":
            add_material("Натяжное ПВХ полотно и багет / Natyajnoy potolok plyonkasi", current_volume * 1.10, "m²")
            
        elif item.id == "gipsokarton":
            add_material("Листы гипсокартона (ГКЛ) / Gipsokarton varaqlari", current_volume * 1.10, "m²")
            weight = (current_volume * 2.2) * 1.10
            add_material("Профиль металлический (CD/UD) / Metall profil", weight, "m.p.")
            
        elif item.id == "elektro":
            meters = (total_floor_area * 4.5) * 1.10
            add_material("Силовой кабель ВВГнг и гофра / Kuchlanish kabeli va gofra", meters, "m.p.")
            
        elif item.id == "santexnika":
            meters = (total_floor_area * 1.2) * 1.10
            add_material("Трубы экопластик водопроводные (PPR) / Suv quvurlari (ekoplastik)", meters, "m.p.")

    return {
        "total_work_cost": round(total_work_cost),
        "materials_list": list(materials_dict.values()),  # Конвертируем обратно в плоский список для фронтенда
        "calculated_volumes": {
            "total_floor_area": round(total_floor_area, 2),
            "total_wall_area": round(total_wall_area, 2),
            "total_ceiling_area": round(total_ceiling_area, 2),
            "total_perimeter": round(total_perimeter, 2)
        },
        "status": "success"
    }
