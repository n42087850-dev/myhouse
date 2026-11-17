# MYHOUSE PRO

Xonadon ta'miri smetasi, 3D-komnata va mebel buyurtma tizimi.

```
frontend/   statik sayt (HTML + CSS + modulli JS), index.html, data/catalog.json, images/
backend/    FastAPI: /order (Telegram), /calculate, /design, /health
```

## Ishga tushirish

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID ni to'ldiring
uvicorn app.main:app --reload   # http://localhost:8000/docs
pytest                          # testlar
```
`TELEGRAM_BOT_TOKEN` yoki `TELEGRAM_CHAT_ID` berilmasa server ataylab ishga tushmaydi.

### 2. Frontend
`data/catalog.json` ni `fetch` qiladi, shuning uchun fayl sifatida emas, server orqali oching:
```bash
cd frontend
python -m http.server 5500      # http://localhost:5500
```
Productionda `index.html` ichida `config.js` dan oldin `<script>window.MYHOUSE_API_URL = "https://api.sizning-domen.uz";</script>` qo'shing yoki `js/config.js` dagi `API_URL` ni o'zgartiring. Backend `.env` dagi `ALLOWED_ORIGINS` ga frontend domenini yozing.

### Docker (backend)
```bash
cd backend && docker build -t myhouse-api . && docker run --env-file .env -p 8000:8000 myhouse-api
```
Docker rasmida `frontend/images` bo'lmaydi, shuning uchun `/design` 404 qaytaradi. Kerak bo'lsa `IMAGES_DIR` ni mount qiling (frontend bu endpointni ishlatmaydi).

## Arxitektura qarorlari
- Telegram tokeni faqat backend `.env` da. Frontend `POST /order` ga `{kind, text, phone, name, photo}` yuboradi, backend esa rasm va matnni Telegramga jo'natadi.
- `/order` da telefon/rasm validatsiyasi, IP bo'yicha rate limit (default 5 ta / 10 daqiqa) va Markdown xatosida oddiy matnga qaytish bor.
- CORS faqat `ALLOWED_ORIGINS` dagi domenlarga ochiq.
- Narxlar va material koeffitsientlari `backend/pricing.json` da.
- Smeta hisobi (wizard) hozircha frontendda (`js/estimate.js`); `/calculate` soddalashtirilgan server variantidir.

## Muhim eslatma: tokenlarni almashtiring
Eski repoda ikkita bot tokeni ochiq bo'lgan. @BotFather da `/revoke` qilib, yangisini faqat `.env` ga yozing.
