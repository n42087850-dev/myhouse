/* MYHOUSE PRO sozlamalari. Tokenlar bu yerda BO'LMASIN: Telegramga yuborish faqat backend orqali. */
window.MYHOUSE_CONFIG = {
    // Backend manzili. Productionda o'z domeningizni yozing (yoki index.html da window.MYHOUSE_API_URL ni belgilang).
    API_URL: (window.MYHOUSE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
};
