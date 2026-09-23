import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="MYHOUSE PRO API", version="1.0.0")

# Настройка CORS (чтобы фронтенд с GitHub Pages или локального файла мог делать запросы)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение папки со статическими картинками (рендерами)
# Поместите ваши 25 картинок в папку "images" рядом с main.py
app.mount("/images", StaticFiles(directory="images"), name="images")

# Конфигурация Telegram-бота
TELEGRAM_BOT_TOKEN = "8940078076:AAER-MoAb3HTJKtDXVkHdrNSRGwv2ekMttI"
TELEGRAM_CHAT_ID = "7200196169"

# --- СХЕМЫ ДАННЫХ (Pydantic models) ---

class RoomData(BaseModel):
    room_type: str  # bedroom, living, kitchen, bathroom, hall
    style: str      # japandi, modern, minimalism, neoclassic, loft
    area: float     # площадь в м2
    height: float   # высота потолков в м

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
    return {"status": "ok", "project": "MYHOUSE PRO API"}

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
    total_area = 0.0
    total_work_cost = 0.0
    
    # Базовая ставка за м2 (в сум)
    PRICE_PER_SQM = 800000 
    
    for room in data.rooms:
        total_area += room.area
        total_work_cost += room.area * PRICE_PER_SQM
        
    # Пример расчета необходимых материалов (с 10% запасом)
    laminate_sqm = total_area * 1.10
    paint_liters = (total_area * 3.0) * 1.10  # Примерный расчет стен
    
    return {
        "total_area_sqm": round(total_area, 2),
        "total_estimated_cost_uzs": round(total_work_cost, 2),
        "materials_estimate": {
            "laminate_sqm": round(laminate_sqm, 2),
            "paint_liters": round(paint_liters, 2)
        }
    }

# 3. Прием заказа мебели или материалов и отправка в Telegram
@app.post("/order")
def create_order(order: OrderRequest):
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
        response = requests.post(telegram_url, json=payload, timeout=5)
        if response.status_code == 200:
            return {"status": "success", "message": "Buyurtma yuborildi"}
        else:
            raise HTTPException(status_code=500, detail="Telegram API error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
