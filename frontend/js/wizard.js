/* Savollar ustasi (wizard) */
/* ================= МАСТЕР ВОПРОСОВ ================= */
const WZ_KEYS = ['floorState', 'floorFinish', 'wallState', 'wallFinish', 'ceilState', 'ceilFinish'];
const WZ_SEL = { floorState: 'floor-state', floorFinish: 'floor-finish', wallState: 'wall-state', wallFinish: 'wall-finish', ceilState: 'ceiling-state', ceilFinish: 'ceiling-finish' };
const WZ_VALUES = {
    'floor-state': ['raw', 'old', 'ready'],
    'floor-finish': ['laminate', 'spc', 'parquet', 'linoleum', 'carpet', 'tile', 'hydro_tile'],
    'wall-state': ['raw', 'old', 'plastered', 'ready'],
    'wall-finish': ['wallpaper', 'paint', 'plaster', 'tile', 'keramogranit'],
    'ceiling-state': ['raw', 'old', 'ready'],
    'ceiling-finish': ['stretch', 'drywall', 'paint', 'slat', 'pvx']
};
const WZ_ALL = ['bedroom', 'living_room', 'kitchen', 'bathroom', 'toilet', 'child', 'hallway'];
const WZ_DRY = ['bedroom', 'living_room', 'kitchen', 'child', 'hallway'];
const WZ_LB = ['bedroom', 'living_room', 'child'];
const WZ_KBW = ['kitchen', 'bathroom', 'toilet', 'hallway'];
const WZ_NOTE_UZ = "Hisob-kitob taxminiy: aniq miqdor o'lchovdan keyin tasdiqlanadi.";
const WZ_NOTE_RU = "Расчёт ориентировочный: точное количество подтверждается после замера.";
const WZ_BASIS_UZ = "Hisob-kitob mijoz ko'rsatgan holatga asoslangan.";
const WZ_BASIS_RU = "Расчёт сделан по состоянию, которое указал клиент.";

const WZ_Q = {
    floorState:  { uz: "Hozir polingiz qanday?", ru: "Какой сейчас пол?", unknown: true, short: { uz: "Pol (hozir)", ru: "Пол (сейчас)" } },
    floorFinish: { uz: "Polni qanday qilmoqchisiz?", ru: "Какой пол хотите сделать?", unknown: false, short: { uz: "Pol (ta'mir)", ru: "Пол (ремонт)" } },
    wallState:   { uz: "Hozir devorlaringiz qanday?", ru: "В каком состоянии сейчас стены?", unknown: true, short: { uz: "Devorlar (hozir)", ru: "Стены (сейчас)" } },
    wallFinish:  { uz: "Devorlarni qanday qilmoqchisiz?", ru: "Как хотите отделать стены?", unknown: false, short: { uz: "Devorlar (ta'mir)", ru: "Стены (ремонт)" } },
    ceilState:   { uz: "Hozir shiftingiz qanday?", ru: "Какой сейчас потолок?", unknown: true, short: { uz: "Shift (hozir)", ru: "Потолок (сейчас)" } },
    ceilFinish:  { uz: "Shiftni qanday qilmoqchisiz?", ru: "Какой потолок хотите сделать?", unknown: false, short: { uz: "Shift (ta'mir)", ru: "Потолок (ремонт)" } }
};

const WZ_OPTS = {
    floorState: [
        { id: 'fs-raw', v: 'raw', uz: "Yalang beton", ru: "Голый бетон", img: 'floor-state-bare-concrete', rooms: WZ_ALL },
        { id: 'fs-old', v: 'old', uz: "Eski qoplama (linoleum, laminat, parket)", ru: "Старое покрытие (линолеум, ламинат, паркет)", img: 'floor-state-old-covering', rooms: WZ_DRY },
        { id: 'fs-tile', v: 'old', uz: "Eski plitka", ru: "Старая плитка", img: 'floor-state-old-tile', rooms: WZ_ALL },
        { id: 'fs-ready', v: 'ready', uz: "Tekis, tayyor pol (styajka)", ru: "Ровный готовый пол (стяжка)", img: 'floor-state-ready-screed', rooms: WZ_ALL }
    ],
    floorFinish: [
        { id: 'ff-laminate', v: 'laminate', uz: "Laminat", ru: "Ламинат", img: 'floor-laminate', rooms: WZ_DRY },
        { id: 'ff-spc', v: 'spc', uz: "Kvars-vinil (SPC)", ru: "Кварц-винил (SPC)", img: 'floor-spc', rooms: WZ_DRY },
        { id: 'ff-parquet', v: 'parquet', uz: "Parket taxtasi", ru: "Паркетная доска", img: 'floor-parquet', rooms: WZ_LB },
        { id: 'ff-linoleum', v: 'linoleum', uz: "Linoleum", ru: "Линолеум", img: 'floor-linoleum', rooms: WZ_DRY },
        { id: 'ff-tile', v: 'tile', uz: "Plitka / keramogranit", ru: "Плитка / керамогранит", img: 'floor-tile', rooms: WZ_DRY }
    ],
    wallState: [
        { id: 'ws-raw', v: 'raw', uz: "Yalang g'isht yoki beton", ru: "Голый кирпич или бетон", img: 'wall-state-bare-brick', rooms: WZ_ALL },
        { id: 'ws-plastered', v: 'plastered', uz: "Shtukaturka qilingan, lekin tekis emas", ru: "Оштукатурены, но неровные", img: 'wall-state-plastered-uneven', rooms: WZ_ALL },
        { id: 'ws-oldwp', v: 'old', uz: "Eski oboy", ru: "Старые обои", img: 'wall-state-old-wallpaper', rooms: WZ_DRY },
        { id: 'ws-oldpaint', v: 'old', uz: "Eski bo'yoq", ru: "Старая краска", img: 'wall-state-old-paint', rooms: WZ_ALL },
        { id: 'ws-oldtile', v: 'old', uz: "Eski plitka", ru: "Старая плитка", img: 'wall-state-old-tile', rooms: WZ_KBW },
        { id: 'ws-ready', v: 'ready', uz: "Tekis, shpatlevka qilingan", ru: "Ровные, зашпатлёваны", img: 'wall-state-ready-putty', rooms: WZ_ALL }
    ],
    wallFinish: [
        { id: 'wf-wallpaper', v: 'wallpaper', uz: "Oboy (vinil, flizelin)", ru: "Обои (винил, флизелин)", img: 'wall-wallpaper', rooms: WZ_DRY },
        { id: 'wf-paint', v: 'paint', uz: "Devorni bo'yash", ru: "Покраска стен", img: 'wall-paint', rooms: WZ_DRY },
        { id: 'wf-plaster', v: 'plaster', uz: "Dekorativ shtukaturka", ru: "Декоративная штукатурка", img: 'wall-decor-plaster', rooms: WZ_DRY },
        { id: 'wf-tile', v: 'tile', uz: "Plitka (kafel)", ru: "Плитка (кафель)", img: 'wall-tile', rooms: WZ_KBW },
        { id: 'wf-porcelain', v: 'keramogranit', uz: "Katta formatli keramogranit", ru: "Крупноформатный керамогранит", img: 'wall-porcelain-large', rooms: WZ_KBW }
    ],
    ceilState: [
        { id: 'cs-raw', v: 'raw', uz: "Yalang beton plita", ru: "Голая бетонная плита", img: 'ceiling-state-bare-slab', rooms: WZ_ALL },
        { id: 'cs-oldpaint', v: 'old', uz: "Eski bo'yoq yoki ohak", ru: "Старая краска или побелка", img: 'ceiling-state-old-paint', rooms: WZ_ALL },
        { id: 'cs-oldsusp', v: 'old', uz: "Eski tortma yoki gipsokarton shift", ru: "Старый натяжной или гипсокартонный", img: 'ceiling-state-old-suspended', rooms: WZ_ALL },
        { id: 'cs-ready', v: 'ready', uz: "Tekis, tayyor shift", ru: "Ровный готовый потолок", img: 'ceiling-state-ready', rooms: WZ_ALL }
    ],
    ceilFinish: [
        { id: 'cf-stretch', v: 'stretch', uz: "Tortma shift", ru: "Натяжной потолок", img: 'ceiling-stretch', rooms: WZ_ALL },
        { id: 'cf-drywall', v: 'drywall', uz: "Gipsokarton shift", ru: "Гипсокартонный потолок", img: 'ceiling-drywall', rooms: WZ_DRY },
        { id: 'cf-paint', v: 'paint', uz: "Shpatlevka + bo'yoq", ru: "Шпатлёвка + покраска", img: 'ceiling-paint', rooms: WZ_ALL },
        { id: 'cf-slat', v: 'slat', uz: "Reykali shift", ru: "Реечный потолок", img: 'ceiling-slat', rooms: WZ_KBW }
    ]
};

const WZ_DEFAULT = { floorState: 'raw', wallState: 'raw', ceilState: 'raw' };
const WZ = { steps: [], stepIndex: {}, idx: 0, history: [], answers: {}, unknowns: {}, copy: {}, sel: null, fromSummary: false };

function wzProfile(type) {
    if (type === 'bathroom' || type === 'toilet') return 'w';
    if (type === 'kitchen') return 'k';
    return 'ld';
}

function wzOptionsFor(key, type) {
    return WZ_OPTS[key].filter(o => o.rooms.includes(type));
}

function wzSet(roomId, key, opt, unknown) {
    WZ.answers[roomId][key] = { id: opt.id, v: opt.v, uz: opt.uz, ru: opt.ru, unknown: !!unknown, auto: !!opt.auto };
    const sel = document.getElementById(`q-${WZ_SEL[key]}-${roomId}`);
    if (sel) sel.value = opt.v;
    WZ.unknowns[roomId] = WZ_KEYS.filter(k => WZ.answers[roomId][k] && WZ.answers[roomId][k].unknown);
}

function renderPage2Questions() {
    const qContainer = document.getElementById('questions-container');
    qContainer.style.display = 'block';
    document.getElementById('estimate-results-container').innerHTML = '';

    WZ.steps = []; WZ.stepIndex = {}; WZ.idx = 0; WZ.history = [];
    WZ.answers = {}; WZ.unknowns = {}; WZ.copy = {}; WZ.sel = null; WZ.fromSummary = false;

    let hidden = '';
    roomsData.forEach(room => {
        WZ.answers[room.id] = {};
        Object.keys(WZ_VALUES).forEach(sid => {
            hidden += `<select id="q-${sid}-${room.id}" style="display:none">` +
                WZ_VALUES[sid].map(v => `<option value="${v}">${v}</option>`).join('') + `</select>`;
        });
    });
    qContainer.innerHTML = `<div id="wz-hidden">${hidden}</div><div id="wz-view"></div>`;

    roomsData.forEach((room, ri) => {
        const isWet = (room.type === 'bathroom' || room.type === 'toilet');
        const prof = wzProfile(room.type);
        let prev = -1;
        for (let j = ri - 1; j >= 0; j--) {
            if (wzProfile(roomsData[j].type) === prof) { prev = j; break; }
        }

        const roomSteps = [];
        WZ_KEYS.forEach(key => {
            if (key === 'floorFinish' || key === 'wallFinish' || key === 'ceilFinish') {
                const o = r3Chosen(room.id, key === 'floorFinish' ? 'floor' : key === 'wallFinish' ? 'wall' : 'ceil');
                const v = (key === 'floorFinish' && isWet && o.v === 'tile') ? 'hydro_tile' : o.v;
                const uz = (key === 'floorFinish' && isWet && o.v === 'tile') ? o.uz + " (gidroizolyatsiya bilan)" : o.uz;
                const ru = (key === 'floorFinish' && isWet && o.v === 'tile') ? o.ru + " (с гидроизоляцией)" : o.ru;
                wzSet(room.id, key, { id: 'r3-' + o.id, v: v, uz: uz, ru: ru, auto: true }, false);
                return;
            }
            if (key === 'floorFinish' && isWet) {
                wzSet(room.id, key, { id: 'ff-auto', v: 'hydro_tile', auto: true,
                    uz: "Plitka / keramogranit (gidroizolyatsiya bilan)", ru: "Плитка / керамогранит (с гидроизоляцией)" }, false);
                return;
            }
            const opts = wzOptionsFor(key, room.type);
            if (opts.length === 1) { wzSet(room.id, key, Object.assign({ auto: true }, opts[0]), false); return; }
            roomSteps.push({ type: 'q', roomIdx: ri, key });
        });

        let copyIndex = -1;
        if (prev >= 0) {
            WZ.steps.push({ type: 'copy', roomIdx: ri, from: prev });
            copyIndex = WZ.steps.length - 1;
        }
        roomSteps.forEach((s, k) => {
            s.qNum = k + 1; s.qTotal = roomSteps.length;
            WZ.steps.push(s);
            WZ.stepIndex[`${ri}:${s.key}`] = WZ.steps.length - 1;
        });
        if (copyIndex >= 0) WZ.steps[copyIndex].skipTo = WZ.steps.length;
    });

    wzRender();
}

function wzCardHTML(o, selected) {
    const src = `./images/${o.img}.jpg`;
    return `
        <div class="wz-card ${selected ? 'sel' : ''}" data-id="${o.id}" onclick="wzPick('${o.id}')">
            <div class="wz-imgbox">
                <div class="wz-ph">🖼</div>
                <img src="${src}" alt="" loading="lazy" onerror="wzImgFail(this)">
                <span class="wz-check">✓</span>
                <span class="wz-zoom" onclick="event.stopPropagation(); wzZoom('${src}')">🔍</span>
            </div>
            <div class="wz-names">
                <div class="wz-name-uz">${o.uz}</div>
                <div class="wz-name-ru">${o.ru}</div>
            </div>
        </div>`;
}

function wzSimpleCardHTML(id, icon, uz, ru, selected, wide) {
    return `
        <div class="wz-card noimg ${wide ? 'wide' : ''} ${selected ? 'sel' : ''}" data-id="${id}" onclick="wzPick('${id}')">
            <div class="wz-imgbox">
                <div class="wz-ph" style="opacity: 0.8;">${icon}</div>
                <span class="wz-check">✓</span>
            </div>
            <div class="wz-names">
                <div class="wz-name-uz">${uz}</div>
                <div class="wz-name-ru">${ru}</div>
            </div>
        </div>`;
}

function wzImgFail(img) {
    img.style.display = 'none';
    const z = img.parentElement.querySelector('.wz-zoom');
    if (z) z.style.display = 'none';
}

function wzZoom(src) {
    document.getElementById('wzLbImg').src = src;
    document.getElementById('wzLightbox').style.display = 'flex';
}

function wzRender() {
    const view = document.getElementById('wz-view');
    if (!view) return;

    if (WZ.idx >= WZ.steps.length) { wzRenderSummary(view); return; }

    const st = WZ.steps[WZ.idx];
    const room = roomsData[st.roomIdx];
    const pct = Math.round((WZ.idx / (WZ.steps.length + 1)) * 100);
    let top = `
        <div class="wz-top">
            <div class="wz-room">📍 ${room.typeName} (#${room.displayIndex}) · ${room.floorArea.toFixed(1)} m²</div>
            <div class="wz-count">__COUNT__</div>
            <div class="wz-bar"><div class="wz-bar-fill" style="width: ${pct}%;"></div></div>
        </div>`;
    let body = '';

    if (st.type === 'copy') {
        const from = roomsData[st.from];
        WZ.sel = WZ.copy[room.id] || null;
        top = top.replace('__COUNT__', `Xona ${st.roomIdx + 1} / ${roomsData.length} · Комната ${st.roomIdx + 1} из ${roomsData.length}`);
        body = `
            <div class="wz-q-uz">Oldingi xonadagidek qilamizmi?</div>
            <div class="wz-q-ru">Сделать так же, как в комнате «${from.typeName} (#${from.displayIndex})»?</div>
            <div class="wz-grid">
                ${wzSimpleCardHTML('yes', '✅', "Ha, xuddi shunday", "Да, так же", WZ.sel === 'yes', false)}
                ${wzSimpleCardHTML('no', '✏️', "Yo'q, boshqacha", "Нет, по-другому", WZ.sel === 'no', false)}
            </div>`;
    } else {
        const q = WZ_Q[st.key];
        const saved = WZ.answers[room.id][st.key];
        WZ.sel = saved && !saved.auto ? (saved.unknown ? 'unknown' : saved.id) : null;
        top = top.replace('__COUNT__', `Savol ${st.qNum} / ${st.qTotal} · Вопрос ${st.qNum} из ${st.qTotal}`);
        const opts = wzOptionsFor(st.key, room.type);
        const unknownCard = q.unknown
            ? wzSimpleCardHTML('unknown', '❓', "Bilmayman", "Не знаю (возьмём стандартный вариант, уточнит замерщик)", WZ.sel === 'unknown', true)
            : '';
        body = `
            <div class="wz-q-uz">${q.uz}</div>
            <div class="wz-q-ru">${q.ru}</div>
            <div class="wz-grid">
                ${opts.map(o => wzCardHTML(o, WZ.sel === o.id)).join('')}
                ${unknownCard}
            </div>`;
    }

    view.innerHTML = top + body + `
        <div class="wz-nav">
            <button class="btn btn-secondary" onclick="wzBack()">❮ Orqaga / Назад</button>
            <button class="btn btn-calc" id="wzNextBtn" style="margin-top: 0;" onclick="wzNext()" ${WZ.sel ? '' : 'disabled'}>Keyingi / Далее ❯</button>
        </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wzPick(id) {
    WZ.sel = id;
    document.querySelectorAll('#wz-view .wz-card').forEach(c => {
        c.classList.toggle('sel', c.getAttribute('data-id') === id);
    });
    const btn = document.getElementById('wzNextBtn');
    if (btn) btn.disabled = false;
}

function wzNext() {
    if (!WZ.sel) return;
    const st = WZ.steps[WZ.idx];
    const room = roomsData[st.roomIdx];
    WZ.history.push(WZ.idx);

    if (st.type === 'copy') {
        WZ.copy[room.id] = WZ.sel;
        if (WZ.sel === 'yes') {
            const src = roomsData[st.from];
            ['floorState', 'wallState', 'ceilState'].forEach(k => {
                const a = WZ.answers[src.id][k];
                if (a) wzSet(room.id, k, a, a.unknown);
            });
            WZ.idx = st.skipTo;
        } else {
            WZ.idx = WZ.idx + 1;
        }
    } else {
        const opts = wzOptionsFor(st.key, room.type);
        if (WZ.sel === 'unknown') {
            const def = WZ_DEFAULT[st.key];
            const o = opts.find(x => x.v === def) || opts[0];
            wzSet(room.id, st.key, o, true);
        } else {
            const o = opts.find(x => x.id === WZ.sel);
            wzSet(room.id, st.key, o, false);
        }
        WZ.idx = WZ.fromSummary ? WZ.steps.length : WZ.idx + 1;
        WZ.fromSummary = false;
    }
    wzRender();
}

function wzBack() {
    if (WZ.fromSummary) { WZ.fromSummary = false; WZ.idx = WZ.steps.length; wzRender(); return; }
    if (WZ.history.length === 0) { goToPage(1); return; }
    WZ.idx = WZ.history.pop();
    wzRender();
}

function wzEdit(stepIdx) {
    WZ.fromSummary = true;
    WZ.idx = stepIdx;
    wzRender();
}

function wzRenderSummary(view) {
    let html = `
        <div class="wz-top">
            <div class="wz-room">✅ Tekshirib chiqing / Проверьте ответы</div>
            <div class="wz-bar"><div class="wz-bar-fill" style="width: 100%;"></div></div>
        </div>
        <div class="wz-q-uz">Hammasi to'g'rimi?</div>
        <div class="wz-q-ru">Всё верно? Любой ответ можно изменить.</div>`;
    roomsData.forEach((room, ri) => {
        html += `<div class="room-card" style="margin-bottom: 14px; padding: 16px;">
            <div class="room-title" style="font-size: 15px;">📍 ${room.typeName} (#${room.displayIndex})</div>`;
        WZ_KEYS.forEach(key => {
            const a = WZ.answers[room.id][key];
            if (!a) return;
            const idx = WZ.stepIndex[`${ri}:${key}`];
            const label = WZ_Q[key].short;
            html += `
                <div class="wz-sum-row">
                    <div>
                        <div class="wz-sum-label">${label.uz} / ${label.ru}</div>
                        <div><b>${a.unknown ? "Bilmayman / Не знаю" : a.uz}</b></div>
                        <div class="wz-sum-label">${a.unknown ? 'Standart: ' + a.uz + ' / ' + a.ru : a.ru}</div>
                    </div>
                    ${idx !== undefined ? `<button class="wz-edit" onclick="wzEdit(${idx})">✎ O'zgartirish / Изменить</button>` : ''}
                </div>`;
        });
        html += `</div>`;
    });
    html += `
        <div class="wz-nav">
            <button class="btn btn-secondary" style="flex: 0 0 34%;" onclick="wzBack()">❮ Orqaga / Назад</button>
            <button class="btn btn-calc" style="margin-top: 0;" onclick="wzFinish()">📋 Smetani shakllantirish / Сформировать смету</button>
        </div>`;
    view.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wzFinish() {
    calculateFinalEstimate();
    document.getElementById('questions-container').style.display = 'none';
    document.getElementById('estimate-results-container').insertAdjacentHTML('afterbegin', `
        <button class="btn btn-secondary" style="margin-bottom: 15px;" onclick="wzReopen()">❮ Javoblarni o'zgartirish / Изменить ответы</button>
    `);
    document.getElementById('estimate-results-container').insertAdjacentHTML('beforeend', crewBoxHTML());
}

function wzReopen() {
    document.getElementById('questions-container').style.display = 'block';
    document.getElementById('estimate-results-container').innerHTML = '';
    WZ.idx = WZ.steps.length;
    wzRender();
}
