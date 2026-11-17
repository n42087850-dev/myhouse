/* Yakuniy smeta hisobi */
function calculateFinalEstimate() {
    const resContainer = document.getElementById('estimate-results-container');
    resContainer.innerHTML = `
        <h3 style="color: var(--accent-cyan); margin-bottom: 15px; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;">
            📋 Yakuniy qurilish smetasi / Итоговая смета
        </h3>
        <div class="wz-warn">⚠️ ${WZ_NOTE_UZ}<br>${WZ_NOTE_RU}</div>
    `;

    let overallTotals = {};
    let totalFloorAreaAll = 0;
    let totalWallAreaAll = 0;
    let fullTelegramText = `🏠 *BUTUN UY BO'YICHA UMUMIY SMETA (MYHOUSE PRO)*\n⚠️ ${WZ_NOTE_UZ} / ${WZ_NOTE_RU}\n📋 ${WZ_BASIS_UZ} / ${WZ_BASIS_RU}\n\n`;

    roomsData.forEach(room => {
        totalFloorAreaAll += room.floorArea;
        totalWallAreaAll += room.wallArea;

        let items = [];

        const floorState = document.getElementById(`q-floor-state-${room.id}`)?.value;
        const floorFinish = document.getElementById(`q-floor-finish-${room.id}`)?.value;
        const wallState = document.getElementById(`q-wall-state-${room.id}`)?.value;
        const wallFinish = document.getElementById(`q-wall-finish-${room.id}`)?.value;
        const ceilingState = document.getElementById(`q-ceiling-state-${room.id}`)?.value;
        const ceilingFinish = document.getElementById(`q-ceiling-finish-${room.id}`)?.value;

        if (floorState === 'raw') {
            items.push({ name: "Nivelirlovchi pol aralashmasi (styajka) / Наливной пол / Самонивелир (Стяжка)", qty: Math.ceil(room.floorArea * 12), unit: "kg" });
        } else if (floorState === 'old') {
            items.push({ name: "Pol uchun tekislovchi aralashma / Выравнивающая смесь для пола", qty: Math.ceil(room.floorArea * 6), unit: "kg" });
        }

        if (floorFinish === 'laminate') {
            items.push({ name: "Laminat (+ 5% zaxira) / Ламинат (+ 5% запас)", qty: parseFloat((room.floorArea * 1.05).toFixed(1)), unit: "m²" });
            items.push({ name: "Laminat osti qoplamasi (podlojka) / Подложка под ламинат", qty: parseFloat(room.floorArea.toFixed(1)), unit: "m²" });
            items.push({ name: "Pol plintusi / Плинтус напольный", qty: parseFloat((2 * (room.length + room.width)).toFixed(1)), unit: "p.m. / п.м." });
        } else if (floorFinish === 'spc') {
            items.push({ name: "Kvars-vinil / SPC (+ 5% zaxira) / Кварц-винил / SPC (+ 5% запас)", qty: parseFloat((room.floorArea * 1.05).toFixed(1)), unit: "m²" });
            items.push({ name: "SPC uchun maxsus podlojka / Специальная подложка SPC", qty: parseFloat(room.floorArea.toFixed(1)), unit: "m²" });
            items.push({ name: "Pol plintusi / Плинтус напольный", qty: parseFloat((2 * (room.length + room.width)).toFixed(1)), unit: "p.m. / п.м." });
        } else if (floorFinish === 'parquet') {
            items.push({ name: "Parket taxtasi (+ 7% zaxira) / Паркетная доска (+ 7% запас)", qty: parseFloat((room.floorArea * 1.07).toFixed(1)), unit: "m²" });
            items.push({ name: "Parket uchun yelim / podlojka / Клей / Подложка для паркета", qty: parseFloat(room.floorArea.toFixed(1)), unit: "m²" });
            items.push({ name: "Yog'och / MDF plintus / Плинтус деревянный / МДФ", qty: parseFloat((2 * (room.length + room.width)).toFixed(1)), unit: "p.m. / п.м." });
        } else if (floorFinish === 'linoleum') {
            items.push({ name: "Linoleum (+ 5% zaxira) / Линолеум (+ 5% запас)", qty: parseFloat((room.floorArea * 1.05).toFixed(1)), unit: "m²" });
            items.push({ name: "Pol plintusi / Плинтус напольный", qty: parseFloat((2 * (room.length + room.width)).toFixed(1)), unit: "p.m. / п.м." });
        } else if (floorFinish === 'carpet') {
            items.push({ name: "Kovrolin (+ 5% zaxira) / Ковролин (+ 5% запас)", qty: parseFloat((room.floorArea * 1.05).toFixed(1)), unit: "m²" });
            items.push({ name: "Pol plintusi / Плинтус напольный", qty: parseFloat((2 * (room.length + room.width)).toFixed(1)), unit: "p.m. / п.м." });
        } else if (floorFinish === 'tile' || floorFinish === 'hydro_tile') {
            if (floorFinish === 'hydro_tile') {
                items.push({ name: "Gidroizolyatsiya mastikasi / Гидроизоляционная мастика", qty: parseFloat((room.floorArea * 1.5).toFixed(1)), unit: "kg" });
            }
            items.push({ name: "Pol uchun plitka / keramogranit (+ 10%) / Плитка / Керамогранит для пола (+ 10%)", qty: parseFloat((room.floorArea * 1.1).toFixed(1)), unit: "m²" });
            items.push({ name: "Plitka yelimi (25 kg) / Клей для плитки (25 кг)", qty: Math.ceil(room.floorArea / 4), unit: "qop / меш." });
        }

        if (wallState === 'raw') {
            items.push({ name: "Gipsli shtukaturka / Штукатурка гипсовая (Штукатурка)", qty: Math.ceil(room.wallArea * 10), unit: "kg" });
            items.push({ name: "Shpatlevka: boshlang'ich + finish / Шпатлевка базовый + финиш", qty: Math.ceil(room.wallArea / 8), unit: "qop / меш." });
        } else if (wallState === 'old') {
            items.push({ name: "Finish shpatlevka / Шпатлевка финишная", qty: Math.ceil(room.wallArea / 12), unit: "qop / меш." });
        } else if (wallState === 'plastered') {
            items.push({ name: "Tekislash uchun finish shpatlevka / Финишная шпатлевка для выравнивания", qty: Math.ceil(room.wallArea / 15), unit: "qop / меш." });
        }

        if (wallFinish === 'wallpaper') {
            items.push({ name: "Oboy (rulon 1.06 m x 10 m) / Обои (рулон 1.06м x 10м)", qty: Math.ceil(room.wallArea / 10), unit: "rulon / рул." });
            items.push({ name: "Oboy yelimi / Клей для обоев", qty: Math.ceil(room.wallArea / 45), unit: "pachka / пач." });
        } else if (wallFinish === 'paint') {
            items.push({ name: "Interer bo'yog'i (2 qatlam) / Краска интерьерная (в 2 слоя)", qty: parseFloat((room.wallArea * 0.25).toFixed(1)), unit: "l / л" });
            items.push({ name: "Maxsus pautinka / shisha tola / Спец. паутинка / Стеклохолст", qty: parseFloat((room.wallArea * 1.05).toFixed(1)), unit: "m²" });
        } else if (wallFinish === 'plaster') {
            items.push({ name: "Dekorativ shtukaturka / panellar / Декоративная штукатурка / Панели", qty: parseFloat(room.wallArea.toFixed(1)), unit: "m²" });
            items.push({ name: "Himoya laki / mum / Защитный лак / Воск", qty: parseFloat((room.wallArea * 0.1).toFixed(1)), unit: "l / л" });
        } else if (wallFinish === 'tile' || wallFinish === 'keramogranit') {
            items.push({ name: `Devor plitkasi (${wallFinish === 'keramogranit' ? 'Keramogranit' : 'Kafel'}) + 10% / Плитка стен (${wallFinish === 'keramogranit' ? 'Керамогранит' : 'Кафель'}) + 10%`, qty: parseFloat((room.wallArea * 1.1).toFixed(1)), unit: "m²" });
            items.push({ name: "Plitka yelimi (25 kg) / Клей плиточный (25кг)", qty: Math.ceil(room.wallArea / 4), unit: "qop / меш." });
            items.push({ name: "Choklar uchun zatirka / Затирка для швов", qty: Math.ceil(room.wallArea / 10), unit: "kg" });
        }

        if (ceilingFinish === 'stretch') {
            items.push({ name: "Tortma shift (PVX / mato) / Натяжной потолок (ПВХ/Ткань)", qty: parseFloat(room.floorArea.toFixed(1)), unit: "m²" });
            items.push({ name: "Shift uchun profil va bagget / Профиль и багет для потолка", qty: parseFloat((2 * (room.length + room.width)).toFixed(1)), unit: "p.m. / п.м." });
        } else if (ceilingFinish === 'drywall') {
            items.push({ name: "Shift uchun gipsokarton (GKL 9.5 mm) / Гипсокартон потолочный (ГКЛ 9.5 мм)", qty: Math.ceil(room.floorArea / 3), unit: "list / лист" });
            items.push({ name: "Metall profil (CD/UD) / Профиль металлический (CD/UD)", qty: parseFloat((2 * (room.length + room.width) * 1.5).toFixed(1)), unit: "p.m. / п.м." });
            items.push({ name: "Shift uchun oq bo'yoq / Краска потолочная белая", qty: parseFloat((room.floorArea * 0.25).toFixed(1)), unit: "l / л" });
        } else if (ceilingFinish === 'paint') {
            items.push({ name: "Shift uchun finish shpatlevka / Шпатлевка финишная для потолка", qty: Math.ceil(room.floorArea / 10), unit: "qop / меш." });
            items.push({ name: "Shift uchun suv asosidagi bo'yoq (vodoemulsiya) / Краска потолочная водно-дисперсионная", qty: parseFloat((room.floorArea * 0.25).toFixed(1)), unit: "l / л" });
        } else if (ceilingFinish === 'pvx') {
            items.push({ name: "PVX shift panellari (+ 10% zaxira) / ПВХ-панели для потолка (+ 10% запас)", qty: parseFloat((room.floorArea * 1.1).toFixed(1)), unit: "m²" });
            items.push({ name: "Profil va burchak / Профиль и уголок", qty: parseFloat((2 * (room.length + room.width) * 1.1).toFixed(1)), unit: "p.m. / п.м." });
        } else if (ceilingFinish === 'slat') {
            items.push({ name: "Reykali metall shift / Реечный металлический потолок", qty: parseFloat(room.floorArea.toFixed(1)), unit: "m²" });
        }

        items.push({ name: "Chuqur kirib boruvchi gruntovka / Грунтовка глубокого проникновения", qty: parseFloat(((room.wallArea + (room.floorArea * 2)) * 0.15).toFixed(1)), unit: "l / л" });

        let itemsHTML = '';
        let singleRoomTG = `🏠 *Smeta: ${room.typeName} (#${room.displayIndex})*\n`;

        items.forEach(it => {
            const key = `${it.name}|${it.unit}`;
            if (!overallTotals[key]) {
                overallTotals[key] = { name: it.name, qty: 0, unit: it.unit };
            }
            overallTotals[key].qty += it.qty;

            itemsHTML += `
                <div class="estimate-item">
                    <span>• ${it.name}</span>
                    <b style="color: var(--accent-cyan);">${it.qty}${it.unit}</b>
                </div>
            `;
            singleRoomTG += `• ${it.name}: ${it.qty}${it.unit}\n`;
        });

        const unkKeys = (WZ.unknowns && WZ.unknowns[room.id]) ? WZ.unknowns[room.id] : [];
        let unkHTML = '';
        if (unkKeys.length) {
            const unkNames = unkKeys.map(k => WZ_Q[k].short.uz + ' / ' + WZ_Q[k].short.ru).join(', ');
            unkHTML = `<div class="wz-warn">⚠️ «Bilmayman» / «Не знаю»: ${unkNames}.<br>Standart variant olindi, zamerchi aniqlaydi. / Взят стандартный вариант, уточнит замерщик.</div>`;
            singleRoomTG += `⚠️ Bilmayman / Не знаю: ${unkNames}\n`;
        }

        const ansObj = (WZ.answers && WZ.answers[room.id]) ? WZ.answers[room.id] : {};
        const ansPair = (stateKey, finishKey, label) => {
            const s = ansObj[stateKey], f = ansObj[finishKey];
            if (!s || !f) return null;
            return {
                label: label,
                sUz: s.unknown ? `Bilmayman (standart: ${s.uz})` : s.uz,
                sRu: s.unknown ? `Не знаю (стандарт: ${s.ru})` : s.ru,
                fUz: f.uz, fRu: f.ru
            };
        };
        const ansRows = [
            ansPair('floorState', 'floorFinish', { uz: 'Pol', ru: 'Пол' }),
            ansPair('wallState', 'wallFinish', { uz: 'Devorlar', ru: 'Стены' }),
            ansPair('ceilState', 'ceilFinish', { uz: 'Shift', ru: 'Потолок' })
        ].filter(Boolean);
        let ansHTML = '';
        if (ansRows.length) {
            ansHTML = `<div class="wz-ans"><div class="wz-ans-title">📋 Mijoz javoblari / Ответы клиента</div>` +
                ansRows.map(r => `<div class="wz-ans-row"><b>${r.label.uz} /${r.label.ru}</b><br><span>${r.sUz} /${r.sRu}</span><br><span>→ ${r.fUz} /${r.fRu}</span></div>`).join('') +
                `<div class="wz-ans-note">${WZ_BASIS_UZ}<br>${WZ_BASIS_RU}</div></div>`;
            singleRoomTG += `📋 Mijoz javoblari / Ответы клиента:\n` +
                ansRows.map(r => `• ${r.label.uz}: ${r.sUz} →${r.fUz}`).join('\n') + `\n`;
        }

        // --- ШАГ 3: Получаем точные названия выбранных 3D-текстур ---
        const currentFloorOpt = r3Chosen(room.id, 'floor');
        const currentWallOpt = r3Chosen(room.id, 'wall');
        const currentCeilOpt = r3Chosen(room.id, 'ceil');

        let designDetails = `🎨 *Dizayn / Дизайн:* \n` +
                            `• 🪵 Pol: ${currentFloorOpt.uz} (${currentFloorOpt.ru})\n` +
                            `• 🧱 Devor: ${currentWallOpt.uz} (${currentWallOpt.ru})\n` +
                            `• 💡 Shift: ${currentCeilOpt.uz} (${currentCeilOpt.ru})\n`;

        singleRoomTG += `\n` + designDetails;

        fullTelegramText += `📍 *${room.typeName} (#${room.displayIndex})*\n` +
                           `📏 Maydoni: ${room.floorArea.toFixed(1)} m² | Devorlar: ${room.wallArea.toFixed(1)} m²\n${singleRoomTG.replace(/^🏠 .*\n/, '')}\n`;

        const roomEstimateHTML = `
            <div class="room-card">
                <div class="room-title" style="color: var(--accent-green); font-size: 16px;">
                    ${room.typeName} (#${room.displayIndex}) uchun smeta
                </div>
                <div style="margin-bottom: 15px;">
                    ${itemsHTML}
                </div>
                ${ansHTML}${unkHTML}
                <button class="btn btn-secondary" style="font-size: 12px; padding: 10px 12px;" onclick="openOrderModal('single_estimate', '${encodeURIComponent(singleRoomTG).replace(/'/g, '%27')}')">
                    ✈ Smetani Telegramga yuborish
                </button>
            </div>
        `;
        resContainer.insertAdjacentHTML('beforeend', roomEstimateHTML);
    });
    let overallHTML = '';
    let summaryTG = `📊 *UMUMIY MATERIAL SHAKLI (ИТОГОВЫЙ РАСЧЕТ НА ВЕСЬ ОБЪЕКТ):*\n`;
    summaryTG += `🏠 Xonalar soni: ${roomsData.length} ta\n`;
    summaryTG += `📐 Umumiy pol maydoni: ${totalFloorAreaAll.toFixed(1)} m²\n`;
    summaryTG += `🧱 Umumiy devor maydoni: ${totalWallAreaAll.toFixed(1)} m²\n\n`;

    for (let k in overallTotals) {
        const item = overallTotals[k];
        const displayQty = (typeof item.qty === 'number' && !Number.isInteger(item.qty)) ? item.qty.toFixed(1) : item.qty;
        
        overallHTML += `
            <div class="estimate-item">
                <span style="font-weight: 600;">• ${item.name}</span>
                <b style="color: var(--accent-gold); font-size: 14px;">${displayQty}${item.unit}</b>
            </div>
        `;
        summaryTG += `• ${item.name}: ${displayQty}${item.unit}\n`;
    }

    fullTelegramText = summaryTG + `\n------------------------\n\n` + fullTelegramText;

    const totalSummaryCardHTML = `
        <div class="room-card" style="border: 2px solid var(--accent-gold); background: #182243;">
            <div class="room-title" style="color: var(--accent-gold); font-size: 18px; text-align: center; margin-bottom: 10px;">
                🏆 BUTUN KVARTIRA BO'YICHA UMUMIY HISOB-KITOB / ОБЩИЙ ИТОГОВЫЙ РАСЧЕТ ПО ВСЕЙ КВАРТИРЕ
            </div>
            <div style="font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 15px;">
                🏠 Xonalar soni: <b>${roomsData.length}</b> | 📐 Umumiy pol maydoni: <b>${totalFloorAreaAll.toFixed(1)} m²</b> \vert{} 🧱 Devorlar: <b>${totalWallAreaAll.toFixed(1)} m²</b>
            </div>
            <div style="margin-bottom: 20px;">
                ${overallHTML}
            </div>
            <button class="btn btn-custom" style="font-size: 15px; padding: 14px 16px;" onclick="openOrderModal('all_estimates', '${encodeURIComponent(fullTelegramText).replace(/'/g, '%27')}')">
                ✈ Yuborish (Butun uy smetasi) / Отправить общую смету в Telegram
            </button>
        </div>
    `;

    resContainer.insertAdjacentHTML('afterbegin', totalSummaryCardHTML);
    resContainer.scrollIntoView({ behavior: 'smooth' });
}
