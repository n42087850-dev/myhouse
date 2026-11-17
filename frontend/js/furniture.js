/* Mebel katalogi va modal */
/* ================= МЕБЕЛЬНЫЙ МОДАЛ ================= */
function openFurnitureModal() {
    const modalContent = document.querySelector('#furnitureModal .modal-content');
    renderHuvaydoCatalog();
    document.getElementById('furnitureModal').style.display = 'flex';
    if (modalContent) modalContent.scrollTop = 0;
}

function closeFurnitureModal() {
    document.getElementById('furnitureModal').style.display = 'none';
}

function renderHuvaydoCatalog() {
    document.getElementById('modalCatalogTitle').innerText = "HUVAYDO MEBEL KATALOGI";
    const listContainer = document.getElementById('huvaydoCatalogList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';

    huvaydoCatalog.forEach(cat => {
        let categoryHTML = `<div class="huvaydo-category-title">${cat.category}</div><div>`;
        cat.items.forEach(item => {
            const imageSrc = item.coverImg || (item.images && item.images[0]) || '';
            categoryHTML += `
                <div class="huvaydo-card" onclick="openItemDetail('${item.id}')">
                    <img src="${imageSrc}" class="huvaydo-thumb" alt="${item.name}">
                    <div class="huvaydo-info">
                        <div style="font-size: 15px; font-weight: bold; color: var(--text-main);">${item.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Rasmlar soni: ${item.images ? item.images.length : 1} ta</div>
                    </div>
                </div>
            `;
        });
        categoryHTML += `</div>`;
        listContainer.innerHTML += categoryHTML;
    });

    const modalContent = document.querySelector('#furnitureModal .modal-content');
    if (modalContent) {
        setTimeout(() => {
            modalContent.scrollTop = catalogScrollPosition;
        }, 0);
    }
}

function openItemDetail(itemId) {
    const listContainer = document.getElementById('huvaydoCatalogList');
    const modalContent = document.querySelector('#furnitureModal .modal-content');
    if (modalContent) {
        catalogScrollPosition = modalContent.scrollTop;
    }

    let item = null;
    let catType = "";
    huvaydoCatalog.forEach(cat => {
        cat.items.forEach(i => { 
            if(i.id === itemId) {
                item = i;
                catType = cat.type;
            } 
        });
    });
    if(!item) return;

    activeItemData = item;
    currentItemImages = item.images;
    currentSlideIndex = 0;

    document.getElementById('modalCatalogTitle').innerText = item.name;

    let elementsHTML = '';
    if (item.elements && item.elements.length > 0) {
        elementsHTML += `
            <div style="font-size: 12px; font-weight: bold; color: var(--accent-cyan); margin-top: 15px; margin-bottom: 8px;">
                🧩 KONSTRUKTOR & GABARITLAR:
            </div>
        `;
        item.elements.forEach((el, index) => {
            elementsHTML += `
                <div class="element-checkbox-item">
                    <div>
                        <strong style="color: var(--text-main);">${el.name}</strong><br>
                        <span style="color: var(--text-muted); font-size: 11px;">📏 ${el.size}</span>${el.note ? `<br><span style="color: var(--text-muted); font-size: 10px; opacity: 0.8;">${el.note}</span>` : ''}
                    </div>
                    <input type="checkbox" class="spatial-item-check" data-name="${el.name}" data-area="${el.area}" data-index="${index}" checked onchange="recalculateSpatialArea()">
                </div>
            `;
        });

        elementsHTML += `
            <div class="spatial-box" id="spatialBox">
                <div class="spatial-title">
                    📐 Xona o'lchamlari tahlili (Sig'adimi? / Влезет или нет)
                </div>

                <div class="room-inputs-box">
                    <div style="font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px;">
                        🏠 Xonangiz o'lchamlari (m):
                    </div>
                    <div class="grid-3" style="margin-bottom: 8px;">
                        <div>
                            <label>Uzunligi (L)</label>
                            <input type="number" id="modalRoomL" placeholder="4.5" step="0.1" oninput="recalculateSpatialArea()">
                        </div>
                        <div>
                            <label>Kengligi (W)</label>
                            <input type="number" id="modalRoomW" placeholder="3.5" step="0.1" oninput="recalculateSpatialArea()">
                        </div>
                        <div>
                            <label>Balandligi (H)</label>
                            <input type="number" id="modalRoomH" placeholder="2.8" step="0.1">
                        </div>
                    </div>
                </div>

                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="spatialProgress"></div>
                </div>
                <div id="spatialStatusTextUz" style="font-size: 11px; font-weight: bold; margin-top: 6px; color: var(--text-muted);">
                    Xona o'lchamlarini kiriting (Masalan: 4.5 va 3.5).
                </div>
                <div id="spatialStatusTextRu" style="font-size: 11px; font-weight: 500; margin-top: 2px; color: var(--text-muted);">
                    Введите размеры комнаты (Например: 4.5 и 3.5).
                </div>
            </div>
        `;
    }

    let actionButtons = '';
    if (catType === 'kitchen' || catType === 'hallway') {
        actionButtons = `
            <button class="btn btn-custom" onclick="openOrderModal('zamer_order', '${item.name}')">📐 Zamerstik chaqirish / Вызвать замерщика</button>
            <button class="btn btn-secondary" onclick="renderHuvaydoCatalog()">❮ Orqaga / Назад</button>
        `;
    } else {
        actionButtons = `
            <button class="btn" onclick="openOrderModal('detailed_order', '${item.name}', 'Komplekt buyurtmasi')">🛍 Buyurtma berish / Заказать комплект</button>
            <button class="btn btn-custom" onclick="openOrderModal('custom_order', '${item.name}')">📐 O'z o'lchamingizga buyurtma / Заказать под свой размер</button>
            <button class="btn btn-secondary" onclick="renderHuvaydoCatalog()">❮ Orqaga / Назад</button>
        `;
    }

    listContainer.innerHTML = `
        <div>
            <div class="slider-box">
                <img id="gallerySliderImg" class="slider-img" src="${currentItemImages[0]}" alt="${item.name}">
                ${currentItemImages.length > 1 ? `
                    <button class="slider-nav slider-prev" onclick="changeSlide(-1)">❮</button>
                    <button class="slider-nav slider-next" onclick="changeSlide(1)">❯</button>
                ` : ''}
            </div>
            <div class="slider-counter" id="slideCounter">1 / ${currentItemImages.length}</div>

            <div style="font-size: 16px; font-weight: bold; color: var(--accent-cyan);">${item.name}</div>${item.material ? `<div style="font-size: 11px; color: var(--accent-gold); margin-top: 2px;"><b>Material:</b> ${item.material}</div>` : ''}
            
            <div style="font-size: 12px; color: var(--text-muted); background: var(--input-bg); padding: 10px; border-radius: 8px; border: 1px solid var(--input-border); margin-top: 10px;">
                <b>Tavsif / Описание:</b><br>${item.desc}
            </div>

            ${elementsHTML}

            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
                ${actionButtons}
            </div>
        </div>
    `;

    if (modalContent) modalContent.scrollTop = 0;
}

function recalculateSpatialArea() {
    const roomLInput = document.getElementById('modalRoomL')?.value;
    const roomWInput = document.getElementById('modalRoomW')?.value;
    
    const roomL = parseFloat(roomLInput);
    const roomW = parseFloat(roomWInput);

    const progressFill = document.getElementById('spatialProgress');
    const statusUz = document.getElementById('spatialStatusTextUz');
    const statusRu = document.getElementById('spatialStatusTextRu');

    if (!roomL || !roomW || roomL <= 0 || roomW <= 0) {
        if (statusUz) {
            statusUz.style.color = 'var(--accent-gold)';
            statusUz.innerHTML = '⚠️ Xonaning uzunligi va kengligini kiriting!';
        }
        if (statusRu) {
            statusRu.style.color = 'var(--accent-gold)';
            statusRu.innerHTML = '⚠️ Укажите длину и ширину комнаты!';
        }
        if (progressFill) progressFill.style.width = '0%';
        return 0;
    }

    const roomArea = roomL * roomW;
    const checkboxes = document.querySelectorAll('.spatial-item-check');
    let selectedFurnitureArea = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedFurnitureArea += parseFloat(cb.getAttribute('data-area')) || 0;
        }
    });

    const percent = roomArea > 0 ? (selectedFurnitureArea / roomArea) * 100 : 0;

    if (progressFill && statusUz && statusRu) {
        progressFill.style.width = `${Math.min(percent, 100).toFixed(1)}%`;

        if (percent < 50) {
            progressFill.style.backgroundColor = 'var(--accent-green)';
            statusUz.style.color = 'var(--accent-green)';
            statusRu.style.color = 'var(--accent-green)';

            statusUz.innerHTML = `✅ Mebel xonaning ${percent.toFixed(1)}% qismini egallaydi (${selectedFurnitureArea.toFixed(2)} m² / ${roomArea.toFixed(1)} m²). Keng va erkin!`;
            statusRu.innerHTML = `✅ Мебель займет ${percent.toFixed(1)}% комнаты (${selectedFurnitureArea.toFixed(2)} м² из ${roomArea.toFixed(1)} м²). Просторно и свободно!`;
        } else if (percent <= 65) {
            progressFill.style.backgroundColor = 'var(--accent-gold)';
            statusUz.style.color = 'var(--accent-gold)';
            statusRu.style.color = 'var(--accent-gold)';

            statusUz.innerHTML = `🟡 Mebel xonaning ${percent.toFixed(1)}% qismini egallaydi (${selectedFurnitureArea.toFixed(2)} m² / ${roomArea.toFixed(1)} m²). Standart shinamlik.`;
            statusRu.innerHTML = `🟡 Мебель займет ${percent.toFixed(1)}% комнаты (${selectedFurnitureArea.toFixed(2)} м² из ${roomArea.toFixed(1)} м²). Оптимальный утиль.`;
        } else {
            progressFill.style.backgroundColor = '#EF4444';
            statusUz.style.color = '#EF4444';
            statusRu.style.color = '#EF4444';

            statusUz.innerHTML = `🛑 Diqqat! Mebel xonaning ${percent.toFixed(1)}% qismini egallaydi (${selectedFurnitureArea.toFixed(2)} m² / ${roomArea.toFixed(1)} m²). Juda tor bo'lishi mumkin!`;
            statusRu.innerHTML = `🛑 Внимание! Мебель займет ${percent.toFixed(1)}% комнаты (${selectedFurnitureArea.toFixed(2)} м² из ${roomArea.toFixed(1)} м²). Может быть очень тесно!`;
        }
    }
    return percent;
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = currentItemImages.length - 1;
    if (currentSlideIndex >= currentItemImages.length) currentSlideIndex = 0;

    const imgEl = document.getElementById('gallerySliderImg');
    imgEl.src = currentItemImages[currentSlideIndex];
    document.getElementById('slideCounter').innerText = `${currentSlideIndex + 1} /${currentItemImages.length}`;
}


