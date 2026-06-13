from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Модель индивидуальных параметров комнат
class RoomData(BaseModel):
    w: Optional[float] = 0.0  # Ширина
    l: Optional[float] = 0.0  # Длина
    h: Optional[float] = 0.0  # Высота
    o: Optional[float] = 0.0  # Окна и двери
    room_type: str            # living_room, bedroom, kitchen, bathroom, toilet
    design_style: str         # loft, minimal, neoclassic, japandi, ethnic_modern
    floor_material: str       # parket, laminat, kafel, ""
    wall_material: str        # oboi1, oboi2, oboi3, ottachento, kraska, ""

# 2. Модель для элемента сметы услуг (Кастомные цены юзера летят сюда)
class WorkItem(BaseModel):
    id: str        # styajka, nalivnoy, laminat, kafel_pol, plintus, shtukaturka, shpatlevka, oboi, boyoq, travertin, gipsokarton, natyajnoy, elektro, santexnika
    name: str      
    price: float   # Кастомная цена за единицу
    unit_type: str # 'f' - пол, 'w' - стены, 'c' - потолок, 'p' - периметр

# 3. Единая модель запроса
class CalculateRequest(BaseModel):
    rooms: List[RoomData]
    selected_works: List[WorkItem]

@app.post("/calculate")
async def calculate(request: CalculateRequest):
    total_floor_area = 0.0
    total_wall_area = 0.0
    total_ceiling_area = 0.0
    total_perimeter = 0.0
    
    total_work_cost = 0.0
    materials_dict: Dict[str, Dict] = {}

    def add_material(name: str, amount_net: float, unit: str, hint: str = ""):
        if amount_net <= 0:
            return
        # Фиксированные 10% запаса согласно ТЗ
        gross_amount = math.ceil(amount_net * 1.10)
        
        if name in materials_dict:
            materials_dict[name]["amount"] += gross_amount
        else:
            materials_dict[name] = {
                "name": name,
                "amount": gross_amount,
                "unit": unit,
                "hint": hint
            }

    # Шаг 1: Покомнатный расчет геометрии и чистовых отделочных материалов
    for r in request.rooms:
        w = r.w if r.w is not None else 0.0
        l = r.l if r.l is not None else 0.0
        h = r.h if r.h is not None else 0.0
        o = r.o if r.o is not None else 0.0

        f_area = w * l
        p_meter = 2 * (w + l)
        w_area = (p_meter * h) - o
        if w_area < 0:
            w_area = 0.0

        total_floor_area += f_area
        total_ceiling_area += f_area
        total_perimeter += p_meter
        total_wall_area += w_area

        # Расчет чистового покрытия ПОЛА (покомнатно)
        if r.floor_material in ["parket", "laminat"]:
            add_material("Laminat (Podlozka bilan)", f_area, "m²", "Pol maydoni + qirqimlar xarajati")
        elif r.floor_material == "kafel":
            add_material("Kafel yelimi (Клей для кафеля)", f_area * 5, "kg", "O'rtacha sarfi: 5 kg/m²")

        # Расчет чистового покрытия СТЕН (покомнатно)
        if r.wall_material in ["oboi1", "oboi2", "oboi3"]:
            add_material("Gulqog'oz (рулон 1.06m x 10m)", w_area / 8.5, "rulon", "1 ta rulon = ~8.5 m² real devor maydoni")
            add_material("Gulqog'oz yelimi (Клей)", w_area * 0.05, "pachka", "1 ta pachka = ~20 m² uchun")
        elif r.wall_material in ["ottachento", "travertin"]:
            add_material("Dekorativ travertin/suvoq aralashmasi", w_area * 2.5, "kg", "Sarfi: ~2.5 kg/m²")
        elif r.wall_material == "kraska":
            add_material("Ichki bo'yoq (Краска интерьерная в 2 слоя)", w_area * 0.3, "L", "Sarfi: 0.3 litr/m²")

    # Шаг 2: Расчет стоимости услуг по кастомным ценам юзера + Черновые материалы
    for item in request.selected_works:
        # Привязка объёмов к типам поверхностей
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

        # Считаем стоимость работы (объем * кастомная цена с фронта!)
        total_work_cost += item.price * current_volume

        # Генерация общестроительных черновых материалов по кликнутым чекбоксам
        if item.id == "styajka":
            add_material("Cement (Цемент M400)", total_floor_area * 15, "kg", "Sarfi: 15 kg/m²")
            add_material("Pesok (Песок просеянный)", total_floor_area * 0.04, "m³", "Sarfi: 0.04 m³/m²")
        elif item.id == "nalivnoy":
            add_material("O'zi tekislanuvchi pol aralashmasi (Наливной пол)", total_floor_area * 4, "kg", "Sarfi: ~4 kg/m²")
        elif item.id == "shtukaturka":
            add_material("Gipsli shtukaturka (Rotband)", total_wall_area * 9, "kg", "Qalinligi 10mm uchun: 9 kg/m²")
            add_material("Gruntovka", total_wall_area * 0.2, "L", "Sarfi: 0.2 litr/m²")
        elif item.id == "shpatlevka":
            add_material("Finiş shpatlevka", total_wall_area * 1.2, "kg", "Sarfi: 1.2 kg/m² (2 qatlam)")
        elif item.id == "gipsokarton":
            add_material("Gipsokarton listlari (9.5mm)", total_ceiling_area / 3, "ta (list)", "1 ta standart list = 3 m²")
            add_material("Profil CD-60 (3m)", total_ceiling_area * 2, "ta", "Profil zaxirasi uchun")

    return {
        "status": "success",
        "total_work_cost": round(total_work_cost),
        "materials_list": list(materials_dict.values()),
        "calculated_volumes": {
            "total_floor_area": round(total_floor_area, 2),
            "total_wall_area": round(total_wall_area, 2),
            "total_ceiling_area": round(total_ceiling_area, 2),
            "total_perimeter": round(total_perimeter, 2)
        }
    }
