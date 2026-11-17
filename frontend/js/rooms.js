/* Xonalar ro'yxati (qo'shish/o'chirish, 1-sahifa) */
function addRoom() {
    roomCounter++;
    const currentId = roomCounter;
    const container = document.getElementById('rooms-container');
    let typeOptions = ''; for (let key in roomTypes) typeOptions += `<option value="${key}">${roomTypes[key]}</option>`;

    const isFirst = container.children.length === 0;
    const removeBtnHTML = isFirst ? '' : `<button class="remove-room-btn" onclick="removeRoom(${currentId})" title="O'chirish / Удалить">✕</button>`;

    const roomHTML = `
        <div class="room-card" id="room-${currentId}" onclick="r3SetActive(${currentId})">
            <div class="room-header">
                <div class="room-title">#${container.children.length + 1} Xona / Комната</div>
                ${removeBtnHTML}
            </div>
            <div class="grid-2 form-group">
                <div><label>Xona turi / Тип комнаты</label><select id="type-${currentId}" onchange="r3OnTypeChange(${currentId})">${typeOptions}</select></div>
            </div>
            <div class="grid-3 form-group">
                <div><label>Uzunligi (m) / Длина</label><input type="number" id="length-${currentId}" oninput="r3OnDimChange(${currentId})" placeholder="4.5" step="0.1"></div>
                <div><label>Kengligi (m) / Ширина</label><input type="number" id="width-${currentId}" oninput="r3OnDimChange(${currentId})" placeholder="3.5" step="0.1"></div>
                <div><label>Balandligi (m) / Высота</label><input type="number" id="height-${currentId}" oninput="r3OnDimChange(${currentId})" placeholder="2.8" step="0.1"></div>
            </div>
            <div class="form-group">
                <label>Oynalar va eshiklar (kv. m) / Окна и двери (кв. м)</label>
                <input type="number" id="win-doors-${currentId}" placeholder="4.0" step="0.1">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', roomHTML);
    r3Register(currentId);
    reindexRoomTitles();
}

function removeRoom(id) {
    const el = document.getElementById(`room-${id}`);
    if (el) {
        el.remove();
        reindexRoomTitles();
        r3Unregister(id);
    }
}

function reindexRoomTitles() {
    const roomCards = document.querySelectorAll('#rooms-container .room-card');
    roomCards.forEach((card, idx) => {
        const titleEl = card.querySelector('.room-title');
        if (titleEl) {
            titleEl.innerText = `#${idx + 1} Xona / Комната`;
        }
    });
}

function goToPage(pageNumber) {
    if (pageNumber === 1 && typeof r3Layout === 'function') setTimeout(r3Layout, 0);
    if (pageNumber === 1) {
        document.getElementById('page-1').style.display = 'block';
        document.getElementById('page-2').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function processPage1AndGoToPage2() {
    roomsData = [];
    let isValid = true;
    const roomCards = document.querySelectorAll('#rooms-container .room-card');

    if (roomCards.length === 0) {
        alert("Iltimos, kamida bitta xona qo'shing!\nПожалуйста, добавьте хотя бы одну комнату!");
        return;
    }

    roomCards.forEach((card, index) => {
        const id = card.id.replace('room-', '');

        const length = parseFloat(document.getElementById(`length-${id}`).value);
        const width = parseFloat(document.getElementById(`width-${id}`).value);
        const height = parseFloat(document.getElementById(`height-${id}`).value) || 2.8;
        const winDoors = parseFloat(document.getElementById(`win-doors-${id}`).value) || 0;
        const type = document.getElementById(`type-${id}`).value;

        if (!length || !width || length <= 0 || width <= 0) {
            alert(`Пожалуйста, укажите длину и ширину для комнаты #${index + 1}! / #${index + 1} xona o'lchamlarini kiriting!`);
            isValid = false;
            return;
        }

        const floorArea = length * width;
        const wallArea = (2 * (length + width) * height) - winDoors;

        roomsData.push({
            id: id,
            displayIndex: index + 1,
            type: type,
            typeName: roomTypes[type],
            length: length,
            width: width,
            height: height,
            winDoors: winDoors,
            floorArea: floorArea,
            wallArea: Math.max(wallArea, 0)
        });
    });

    if (!isValid || roomsData.length === 0) return;

    renderPage2Questions();
    document.getElementById('page-1').style.display = 'none';
    document.getElementById('page-2').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
