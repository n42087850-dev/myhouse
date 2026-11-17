import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="MYHOUSE PRO API", version="1.0.0")

# Настройка CORS для работы с GitHub Pages и локальным клиентом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение статических изображений
# Папка "images" должна находиться рядом с main.py
if os.path.exists("images"):
    app.mount("/images", StaticFiles(directory="images"), name="images")

# Безопасное чтение токенов из переменных окружения (с дефолтными значениями для локальной проверки)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8940078076:AAER-MoAb3HTJKtDXVkHdrNSRGwv2ekMttI")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "7200196169")


# --- СХЕМЫ ДАННЫХ (Pydantic models) ---

class RoomData(BaseModel):
    room_type: str  # bedroom, living_room, kitchen, bathroom, toilet
    style: str      # ethnic_modern, japandi, minimal, neoclassic, loft
    length: float   # длина (м)
    width: float    # ширина (м)
    height: float   # высота (м)
    openings: float # проемы дверей/окон (м2)

class CalculateRequest(BaseModel):
    rooms: List[RoomData]

class OrderRequest(BaseModel):
    item_name: str
    client_name: str
    client_phone: str
    category: Optional[str] = "Mebel (Huvaydo)"


# --- РУЧКИ API ---

@app.get("/")
def root():
    return {"status": "ok", "project": "MYHOUSE PRO API", "version": "1.0.0"}

# 1. Получение пути к картинке рендера
@app.get("/design/{room_type}/{style}")
def get_design_preview(room_type: str, style: str):
    image_name = f"{room_type}_{style}.jpg"
    image_url = f"/images/{image_name}"
    return {
        "room_type": room_type,
        "style": style,
        "image_url": image_url
    }

# 2. Расчет сметы и материалов на бэкенде
@app.post("/calculate")
def calculate_smeta(data: CalculateRequest):
    total_floor_area = 0.0
    total_wall_area = 0.0
    
    # Средняя базовая стоимость работ за м2 в Ташкенте (UZS)
    PRICE_PER_SQM = 800000 
    
    for room in data.rooms:
        floor_area = room.length * room.width
        wall_area = (2 * (room.length + room.width) * room.height) - room.openings
        
        total_floor_area += floor_area
        total_wall_area += max(0, wall_area)
        
    total_work_cost = total_floor_area * PRICE_PER_SQM
    
    # Примерный расчет материалов
    laminate_sqm = total_floor_area * 1.08  # +8% на подрезку
    putty_kg = total_wall_area * 1.2        # ~1.2 кг на м2
    paint_liters = (total_wall_area / 6.0) * 2 # 2 слоя краски
    
    return {
        "total_floor_area_sqm": round(total_floor_area, 2),
        "total_wall_area_sqm": round(total_wall_area, 2),
        "total_estimated_cost_uzs": round(total_work_cost, 2),
        "materials_estimate": {
            "laminate_sqm": round(laminate_sqm, 2),
            "putty_kg": round(putty_kg, 2),
            "paint_liters": round(paint_liters, 2)
        }
    }

# 3. Прием заказа мебели/материалов и безопасная отправка в Telegram
@app.post("/order")
def create_order(order: OrderRequest):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise HTTPException(status_code=500, detail="Telegram config missing")

    text_message = (
        f"🚀 **Yangi buyurtma! (MYHOUSE PRO)**\n\n"
        f"📦 **Kategoriya:** {order.category}\n"
        f"🛋 **Mahsulot:** {order.item_name}\n"
        f"👤 **Mijoz:** {order.client_name}\n"
        f"📞 **Tel:** {order.client_phone}"
    )
    
    telegram_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text_message,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(telegram_url, json=payload, timeout=8)
        if response.status_code == 200:
            return {"status": "success", "message": "Buyurtma yuborildi"}
        else:
            raise HTTPException(status_code=500, detail=f"Telegram API Error: {response.text}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
