/* Buyurtma modali: hammasi backend /order ga ketadi */
/* ================= ЛОГИКА МОДАЛЬНОГО ОКНА ДЛЯ ВВОДА ДАННЫХ ================= */

document.getElementById('userPhoneInput').addEventListener('input', (e) => {
    let matrix = e.target.value.replace(/\D/g, '');

    if (!matrix.startsWith('998')) {
        matrix = '998' + matrix;
    }

    matrix = matrix.substring(0, 12);

    let formatted = '+998';
    if (matrix.length > 3) formatted += ' ' + matrix.substring(3, 5);
    if (matrix.length > 5) formatted += ' ' + matrix.substring(5, 8);
    if (matrix.length > 8) formatted += ' ' + matrix.substring(8, 10);
    if (matrix.length > 10) formatted += ' ' + matrix.substring(10, 12);

    e.target.value = formatted;
});

document.getElementById('userPhoneInput').addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && e.target.value.length <= 5) {
        e.preventDefault();
    }
});

function openOrderModal(type, param1 = '', param2 = '') {
    currentOrderAction = { type, param1, param2 };

    const modal = document.getElementById('orderModal');
    const customBox = document.getElementById('customDimensionsBox');
    const nameGroup = document.getElementById('nameGroup');
    const modalTitle = document.getElementById('orderModalTitle');
    const elementsCustomFields = document.getElementById('elementsCustomFields');

    document.getElementById('userNameInput').value = '';
    document.getElementById('userPhoneInput').value = '+998 ';
    document.getElementById('custNote').value = '';
    elementsCustomFields.innerHTML = '';

    document.getElementById('custNoteLabel').innerText = "Izoh / Комментарий:";
    document.getElementById('custNote').placeholder = "Aloxida istaklar / Особые пожелания";
    document.getElementById('crewNotice').style.display = 'none';
    document.getElementById('confirmOrderBtn').innerText = "Yuborish / Отправить";

    if (type === 'custom_order') {
        customBox.style.display = 'block';
        nameGroup.style.display = 'block';
        modalTitle.innerText = "📐 Individal buyurtma / Индивидуальный заказ";

        if (activeItemData && activeItemData.elements && activeItemData.elements.length > 0) {
            activeItemData.elements.forEach((el, idx) => {
                const phW = (el.ph && el.ph.w) ? el.ph.w : '';
                const phH = (el.ph && el.ph.h) ? el.ph.h : '';
                elementsCustomFields.innerHTML += `
                    <div class="form-group" style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; border: 1px solid var(--input-border);">
                        <label style="color: var(--accent-cyan); font-weight: bold;">${el.name}:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div><label>Kengligi (sm) / Ширина (см)</label><input type="number" class="cust-elem-w" data-name="${el.name}" placeholder="${phW}"></div>
                            <div><label>Balandligi (sm) / Высота (см)</label><input type="number" class="cust-elem-h" data-name="${el.name}" placeholder="${phH}"></div>
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                            📏 Chuqurligi: <b style="color: var(--accent-gold);">standart o'lcham</b> / Глубина: <b style="color: var(--accent-gold);">стандартный размер</b>
                        </div>
                    </div>
                `;
            });
        } else {
            elementsCustomFields.innerHTML = `
                <div class="form-group">
                    <label>Kengligi (см) / Ширина (см):</label>
                    <input type="number" id="custWidth" placeholder="200">
                </div>
                <div class="form-group">
                    <label>Balandligi (см) / Высота (см):</label>
                    <input type="number" id="custHeight" placeholder="220">
                </div>
                <div class="form-group">
                    <label>Chuqurligi (см) / Глубина (см):</label>
                    <input type="number" id="custDepth" placeholder="60">
                </div>
            `;
        }
    } else if (type === 'crew') {
        customBox.style.display = 'block';
        nameGroup.style.display = 'block';
        const isPlumbing = (param1 === 'plumbing');
        modalTitle.innerText = isPlumbing ? "🚰 Santexnika ishlari / Сантехнические работы" : "💡 Elektr ishlari / Электрические работы";
        document.getElementById('custNoteLabel').innerText = "Qanday ish kerak? / Какая работа нужна?";
        document.getElementById('custNote').placeholder = isPlumbing
            ? "Masalan: kran almashtirish / Например: заделать кран"
            : "Masalan: rozetka o'rnatish / Например: установить розетки";
        document.getElementById('crewNotice').style.display = 'block';
        document.getElementById('confirmOrderBtn').innerText = "📞 Brigadani chaqirish / Вызвать бригаду";
    } else if (type === 'zamer_order') {
        customBox.style.display = 'none';
        nameGroup.style.display = 'block';
        modalTitle.innerText = "📐 Zamerstik chaqirish / Вызвать замерщика";
    } else if (type === 'single_estimate') {
        customBox.style.display = 'none';
        nameGroup.style.display = 'none';
        modalTitle.innerText = "✈ Smeta yuborish / Отправка сметы";
    } else {
        customBox.style.display = 'none';
        nameGroup.style.display = 'block';
        modalTitle.innerText = "✈ Ma'lumotlarni kiriting / Введите данные";
    }

    modal.style.display = 'flex';
}

function crewBoxHTML() {
    return `
        <div class="crew-box">
            <div class="crew-title">🔧 Brigada chaqirish / Вызвать бригаду</div>
            <div class="crew-sub">Ismingiz va raqamingizni qoldiring, biz sizga aloqaga chiqamiz. / Оставьте имя и номер, с вами свяжутся.</div>
            <div class="crew-btns">
                <button class="btn btn-secondary" onclick="openOrderModal('crew', 'plumbing')">🚰 Santexnika ishlari / Сантехнические работы</button>
                <button class="btn btn-secondary" onclick="openOrderModal('crew', 'electric')">💡 Elektr ishlari / Электрические работы</button>
            </div>
        </div>`;
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    currentOrderAction = null;
}

async function submitOrderModal() {
    if (!currentOrderAction) return;

    const phone = document.getElementById('userPhoneInput').value.trim();
    const name = document.getElementById('userNameInput').value.trim();

    if (phone.replace(/\D/g, '').length < 12) {
        alert("Iltimos, telefon raqamingizni to'liq kiriting!\nПожалуйста, введите полный номер телефона!");
        return;
    }

    const { type, param1, param2 } = currentOrderAction;
    let textMessage = "";
    let photoDataUrl = null;

  if (type === 'single_estimate' || type === 'all_estimates') {
        if (type === 'all_estimates' && !name) { 
            alert("Ismingizni kiriting / Введите имя!"); 
            return; 
        }
        
        const decodedText = decodeURIComponent(param1);
        textMessage = (type === 'all_estimates') 
            ? `${decodedText}\n👤 *Mijoz:* ${name}\n📞 *Tel:* ${phone}` 
            : `${decodedText}\n📞 *Mijoz:* ${phone}`;

        photoDataUrl = snapshot3D();
    } 
    else if (type === 'detailed_order') {
        if (!name) { alert("Ismingizni kiriting / Введите имя!"); return; }
        const furnitureName = param1;
        const orderType = param2;

        const roomL = document.getElementById('modalRoomL')?.value || "Kiritilmagan";
        const roomW = document.getElementById('modalRoomW')?.value || "Kiritilmagan";
        const roomH = document.getElementById('modalRoomH')?.value || "Kiritilmagan";

        let includedItemsStr = "";
        const checkboxes = document.querySelectorAll('.spatial-item-check');
        if (checkboxes.length > 0) {
            checkboxes.forEach(cb => {
                const itemName = cb.getAttribute('data-name');
                const statusIcon = cb.checked ? "✅" : "❌ (O'chirilgan)";
                includedItemsStr += `\n• ${itemName}: ${statusIcon}`;
            });
        } else {
            includedItemsStr = "\n• Standart to'plam";
        }

        textMessage = `🚀 *YANGI BUYURTMA (MYHOUSE PRO)*\n\n` +
                      `📦 *Mahsulot:* ${furnitureName}\n` +
                      `📌 *Turi:* ${orderType}\n\n` +
                      `🏠 *Xona o'lchamlari:* L=${roomL}m, W=${roomW}m, H=${roomH}m\n` +
                      `🧩 *Konstruktor elementlari:*` + `${includedItemsStr}\n\n` +
                      `👤 *Mijoz:* ${name}\n` +
                      `📞 *Tel:* ${phone}`;
    } 
    else if (type === 'crew') {
        if (!name) { alert("Ismingizni kiriting / Введите имя!"); return; }
        const kind = (param1 === 'plumbing') ? "Santexnika / Сантехника" : "Elektr / Электрика";
        const crewNote = mdEsc(document.getElementById('custNote').value.trim() || "—");

        textMessage = `🛠 *BRIGADA CHAQIRISH (MYHOUSE PRO)*\n\n` +
                      `🔧 *Ish turi:* ${kind}\n` +
                      `💬 *Izoh:* ${crewNote}\n\n` +
                      `👤 *Mijoz:* ${mdEsc(name)}\n` +
                      `📞 *Tel:* ${phone}`;
    }
    else if (type === 'zamer_order') {
        if (!name) { alert("Ismingizni kiriting / Введите имя!"); return; }
        const furnitureName = param1;

        textMessage = `📐 *ZAMERGA ODAM CHAQIRISH (MYHOUSE PRO)*\n\n` +
                      `📦 *Kategoriya/Mahsulot:* ${furnitureName}\n\n` +
                      `👤 *Mijoz:* ${name}\n` +
                      `📞 *Tel:* ${phone}`;
    }
    else if (type === 'custom_order') {
        if (!name) { alert("Ismingizni kiriting / Введите имя!"); return; }
        const furnitureName = param1;
        const note = document.getElementById('custNote').value || "Yo'q";

        let customDimsText = "";
        const elemWidthInputs = document.querySelectorAll('.cust-elem-w');
        
        if (elemWidthInputs.length > 0) {
            customDimsText = `\n📐 *O'lchamlar / Размеры (Ш × В × Г, sm/см):*`;
            elemWidthInputs.forEach(inp => {
                const elName = inp.getAttribute('data-name');
                const wVal = inp.value || "—";

                const parentGroup = inp.closest('.form-group');
                const hVal = parentGroup?.querySelector('.cust-elem-h')?.value || "—";

                customDimsText += `\n• ${elName}: ${wVal} × ${hVal} × standart / стандарт`;
            });
        } else {
            const width = document.getElementById('custWidth')?.value || "—";
            const height = document.getElementById('custHeight')?.value || "—";
            const depth = document.getElementById('custDepth')?.value || "—";
            customDimsText = `\n📐 *O'lchamlar (ШхВхГ):* ${width} x ${height} x ${depth} см`;
        }

        textMessage = `🚀 *INDIVIDUAL BUYURTMA (MYHOUSE PRO)*\n\n` +
                      `📦 *Mahsulot:* ${furnitureName}` +
                      `${customDimsText}\n` +
                      `💬 *Izoh:* ${note}\n\n` +
                      `👤 *Mijoz:* ${name}\n` +
                      `📞 *Tel:* ${phone}`;
    }

    try {
        const res = await fetch(`${MYHOUSE_CONFIG.API_URL}/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kind: type,
                text: textMessage,
                phone: phone,
                name: name || null,
                photo: photoDataUrl
            })
        });

        if (res.ok) {
            alert(type === 'crew'
                ? "Ariza yuborildi, siz bilan bog'lanishadi! / Заявка отправлена, с вами свяжутся!"
                : "Muvaffaqiyatli yuborildi! / Успешно отправлено!");
            closeOrderModal();
            if (type === 'detailed_order' || type === 'custom_order' || type === 'zamer_order') {
                closeFurnitureModal();
            }
        } else if (res.status === 429) {
            alert("Juda ko'p so'rov. Birozdan keyin urinib ko'ring / Слишком много запросов, попробуйте позже");
        } else {
            alert("Xatolik yuz berdi / Произошла ошибка");
        }
    } catch (e) {
        alert("Internet ulanishini tekshiring / Проверьте интернет-соединение");
    }
}

// 3D-komnata snapshoti (PNG data URL). Backend uni Telegramga rasm qilib yuboradi.
function snapshot3D() {
    try {
        const canvas = document.getElementById('three-canvas');
        return canvas ? canvas.toDataURL('image/png') : null;
    } catch (e) {
        console.warn("3D snapshot o'tkazib yuborildi:", e);
        return null;
    }
}

// Telegram Markdown uchun foydalanuvchi matnini escape qilish
function mdEsc(s) {
    return String(s).replace(/([_*`\[])/g, '\\$1');
}
