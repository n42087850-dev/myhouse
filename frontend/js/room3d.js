/* 3D-komnata: pol/devor/shift tanlash, teksturalar */
/* ================= 3D-КОМНАТА: выбор отделки пола, стен и потолка ================= */
const R3_ALL = ['bedroom', 'living_room', 'kitchen', 'bathroom', 'toilet', 'child', 'hallway'];
const R3_DRY = ['bedroom', 'living_room', 'kitchen', 'child', 'hallway'];
const R3_LB = ['bedroom', 'living_room', 'child'];
const R3_KBW = ['kitchen', 'bathroom', 'toilet', 'hallway'];

// --- текстуры, нарисованные кодом ---
function r3rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function r3tex(draw, seed, size) {
    size = size || 256;
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), r3rng(seed || 1), size);
    return c.toDataURL('image/jpeg', 0.88);
}
function r3Noise(g, r, n, size, a) {
    for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '0,0,0'},${(r() * a).toFixed(3)})`; g.fillRect(r() * size, r() * size, 1 + r() * 2, 1 + r() * 2); }
}
const r3Wood = (h, s, l0, l1) => (g, r, S) => {
    const rows = 8, hgt = S / rows;
    for (let i = 0; i < rows; i++) {
        let x = -r() * 150;
        while (x < S) {
            const len = 130 + r() * 60, l = l0 + r() * (l1 - l0);
            g.fillStyle = `hsl(${h},${s}%,${l}%)`; g.fillRect(x, i * hgt, len, hgt);
            for (let k = 0; k < 7; k++) { g.strokeStyle = `rgba(60,35,15,${(0.05 + r() * 0.08).toFixed(3)})`; g.beginPath(); const y = i * hgt + 3 + r() * (hgt - 6); g.moveTo(x, y); g.lineTo(x + len, y + (r() - .5) * 3); g.stroke(); }
            g.strokeStyle = 'rgba(30,18,8,.45)'; g.lineWidth = 1; g.strokeRect(x + .5, i * hgt + .5, len, hgt);
            x += len;
        }
    }
};
const r3Basket = (h, s, l0, l1) => (g, r, S) => {
    const u = 64;
    for (let i = 0; i < S / u; i++) for (let j = 0; j < S / u; j++) {
        const horiz = (i + j) % 2 === 0;
        for (let k = 0; k < 4; k++) {
            g.fillStyle = `hsl(${h},${s}%,${l0 + r() * (l1 - l0)}%)`;
            const x = i * u + (horiz ? 0 : k * u / 4), y = j * u + (horiz ? k * u / 4 : 0), w = horiz ? u : u / 4, hh = horiz ? u / 4 : u;
            g.fillRect(x, y, w, hh); g.strokeStyle = 'rgba(30,18,8,.45)'; g.strokeRect(x + .5, y + .5, w - 1, hh - 1);
        }
    }
};
const r3Solid = (c, grain) => (g, r, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); r3Noise(g, r, grain || 900, S, .07); };
const r3Tiles = (n, bg, grout) => (g, r, S) => {
    const u = S / n; g.fillStyle = grout; g.fillRect(0, 0, S, S);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = bg; g.fillRect(i * u + 2, j * u + 2, u - 4, u - 4); g.fillStyle = `rgba(0,0,0,${(r() * 0.04).toFixed(3)})`; g.fillRect(i * u + 2, j * u + 2, u - 4, u - 4); }
};
const r3Carpet = (g, r, S) => { g.fillStyle = 'hsl(32,18%,66%)'; g.fillRect(0, 0, S, S); for (let i = 0; i < 5000; i++) { g.strokeStyle = `rgba(${r() > .5 ? '255,255,255' : '60,45,30'},${(r() * .18).toFixed(3)})`; const x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 4, y + (r() - .5) * 4); g.stroke(); } };
const r3Slats = (g, r, S) => { for (let y = 0; y < S; y += 16) { g.fillStyle = `hsl(30,45%,${46 + r() * 8}%)`; g.fillRect(0, y, S, 12); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, y + 12, S, 4); } };

// --- каталог вариантов ---
       const R3_OPTS = {
    floor: [
        { id: 'f-laminate', v: 'laminate', uz: "Laminat", ru: "Ламинат", rooms: R3_DRY, proc: r3Wood(28, 46, 46, 56), sz: 160 },
        { id: 'f-spc', v: 'spc', uz: "Kvars-vinil (SPC)", ru: "Кварц-винил (SPC)", rooms: R3_DRY, proc: r3Wood(34, 22, 62, 72), sz: 160 },
        { id: 'f-parquet', v: 'parquet', uz: "Parket taxtasi", ru: "Паркетная доска", rooms: R3_LB, proc: r3Basket(26, 52, 38, 50), sz: 160 },
        { id: 'f-linoleum', v: 'linoleum', uz: "Linoleum", ru: "Линолеум", rooms: R3_DRY, proc: r3Solid('hsl(38,12%,70%)', 1400), sz: 120 },
        { id: 'f-tile', v: 'tile', uz: "Plitka / keramogranit", ru: "Плитка / керамогранит", rooms: R3_ALL, proc: r3Tiles(2, 'hsl(210,8%,86%)', 'hsl(0,0%,62%)'), sz: 150 },
        { id: 'f-carpet', v: 'carpet', uz: "Kovrolin", ru: "Ковролин", rooms: R3_LB, proc: r3Carpet, sz: 140 },
        { id: 'f-marble', v: 'tile', uz: "Keramogranit (marmar rasmli)", ru: "Керамогранит под мрамор", rooms: R3_ALL, file: 'tex-porcelain-marble.jpg', kind: 'marble', sz: 120, sz2: 240 },
        { id: 'f-oak', v: 'parquet', uz: "Parket «yolka» (och eman)", ru: "Паркет «ёлочка» светлый дуб", rooms: R3_LB, file: 'tex-parquet-oak-chevron.jpg', kind: 'xy', sz: 140 },
        { id: 'f-walnut', v: 'parquet', uz: "Parket «yolka» (yong'oq)", ru: "Паркет «ёлочка» орех", rooms: R3_LB, file: 'tex-parquet-walnut-chevron.jpg', kind: 'xy', sz: 140 },
        { id: 'f-lam-oak', v: 'laminate', uz: "Laminat (och eman)", ru: "Ламинат светлый дуб", rooms: R3_DRY, file: 'tex-laminate-oak.jpg', kind: 'xy', f: 0.30, sz: 80 },
        { id: 'f-marble-grid', v: 'tile', uz: "Marmar plitka", ru: "Кафель", rooms: R3_ALL, file: 'tex-marble-grid.jpg', kind: 'marble', sz: 120 },
        { id: 'f-calacatta', v: 'tile', uz: "Calacatta marmar", ru: "Мрамор Calacatta", rooms: R3_ALL, file: 'tex-marble-calacatta.jpg', kind: 'marble', sz: 120 },
         
            { 
            id: 'f-lam-12015', 
            v: 'laminate', 
            uz: "Laminat «Yolka» 12015 (Hamkor)", 
            ru: "Ламинат «Ёлочка» 12015 (Партнер)", 
            rooms: R3_DRY, 
            file: 'floor-12015.jpg', 
            kind: 'herringbone_stack', 
            sz: 185,
            boxSq: 2.203,
            pcsInBox: 36
        },
    ], 
   wall: [
    { id: 'w-marble', v: 'keramogranit', uz: "Keramogranit (marmar rasmli)", ru: "Керамогранит под мрамор", rooms: R3_ALL, file: 'tex-porcelain-marble.jpg', kind: 'marble', sz: 120, sz2: 240 },
    { id: 'w-calacatta', v: 'keramogranit', uz: "Calacatta marmar", ru: "Мрамор Calacatta", rooms: R3_ALL, file: 'tex-marble-calacatta.jpg', kind: 'marble', sz: 120 },
    { id: 'w-marble-grid', v: 'tile', uz: "Mramor plitka", ru: "Мраморная плитка", rooms: R3_ALL, file: 'tex-marble-grid.jpg', kind: 'marble', sz: 120 },
    { id: 'w-decor-sand', v: 'plaster', uz: "Dekorativ qum", ru: "Декоративный песок", rooms: R3_DRY, file: 'tex-wall-decor-sand.jpg', kind: 'cover' },
    { id: 'w-palm-leaves', v: 'wallpaper', uz: "Oboy (palma barglari)", ru: "Обои с пальмовыми листьями", rooms: R3_DRY, file: 'oboi_2.jpg', kind: 'blend', f: 0.25, sz: 180 },
    { id: 'w-geo-arch', v: 'wallpaper', uz: "Oboy (geometrik naqsh)", ru: "Обои с геометрическим узором", rooms: R3_DRY, file: 'oboi_3.jpg', kind: 'xy', sz: 90 },
    { id: 'w-wave-lines', v: 'wallpaper', uz: "Oboy (to'lqinli chiziqlar)", ru: "Обои с волнистыми линиями", rooms: R3_DRY, file: 'oboi_4.jpg', kind: 'y', sz: 130 },
    { id: 'w-loft-concrete', v: 'wallpaper', uz: "Oboy (dekorativ )", ru: "Обои под декоративную штукатурку", rooms: R3_DRY, file: 'oboi_5.jpg', kind: 'blend', sz: 110 },
    { id: 'w-linen-gray', v: 'wallpaper', uz: "Oboy (kulrang mato)", ru: "Обои под серый текстиль (рогожка)", rooms: R3_DRY, file: 'oboi_6.jpg', kind: 'blend', sz: 75 },
    { id: 'w-micro-leaves', v: 'wallpaper', uz: "Oboy (mayda barglar)", ru: "Обои с мелким рельефом листьев", rooms: R3_DRY, file: 'oboi_7.jpg', kind: 'xy', sz: 140 }
       ],
    ceil: [
        { id: 'c-slat', v: 'slat', uz: "Reykali shift", ru: "Реечный потолок", rooms: R3_KBW, proc: r3Slats, sz: 128 },
        { id: 'c-emb', v: 'stretch', uz: "Tortma shift, mat (naqshli)", ru: "Натяжной матовый с тиснением", rooms: R3_ALL, file: 'tex-ceiling-emboss.jpg', kind: 'cover' },
        { id: 'c-fabric', v: 'stretch', uz: "Tortma shift (chiziqli mato)", ru: "Белый тканевый с полосками", rooms: R3_ALL, file: 'tex-ceiling-fabric-stripes.jpg', kind: 'y', f: 0.30, sz: 90 },
        { id: 'c-pvx-silver', v: 'pvx', uz: "PVX panel, yaltiroq (kumush chiziqli)", ru: "ПВХ-панель глянцевая с серебристыми линиями", rooms: R3_KBW, file: 'tex-ceiling-pvx-silver.jpg', kind: 'y', f: 0.30, sz: 100 },
        { id: 'c-pvx-wood', v: 'pvx', uz: "PVX panel, oq (yog'och teksturali)", ru: "ПВХ-панель белая под дерево", rooms: R3_KBW, file: 'tex-ceiling-pvx-wood.jpg', kind: 'y', f: 0.30, sz: 100 },
        { id: 'c-slat-gray', v: 'slat', uz: "Reykali shift (kulrang)", ru: "Реечный серый с чёрным швом", rooms: R3_KBW, file: 'tex-ceiling-slat-gray.jpg', kind: 'y', f: 0.30, sz: 70 },
        { id: 'c-oval', v: 'drywall', uz: "Oval shaklli shift", ru: "Овальный потолок с подсветкой", rooms: R3_DRY, file: 'tex-ceiling-oval.jpg', kind: 'cover' },
        { id: 'c-rect', v: 'drywall', uz: "To'rtburchak shift", ru: "Прямоугольный потолок", rooms: R3_DRY, file: 'tex-ceiling-rect.jpg', kind: 'cover' }
    ]
};
const R3_DEFAULT = { floor: { dry: 'f-laminate', wet: 'f-tile' }, wall: { dry: 'w-palm-leaves', wet: 'w-tile' }, ceil: { dry: 'c-emb', wet: 'c-pvx-silver' } };
const R3_SHADE = { back: 0.10, left: 0.30, right: 0.20, floor: 0.14, ceil: 0 };
const R3_FACES = { floor: ['r3-floor'], wall: ['r3-back', 'r3-left', 'r3-right'], ceil: ['r3-ceil'] };

const R3 = { active: null, mat: {}, furniture: {}, tab: 'floor', yaw: -22, pitch: -2, zoom: 1, fit: 1, kk: 1, drag: null };
Object.keys(R3_OPTS).forEach(sf => R3_OPTS[sf].forEach((o, i) => { if (o.proc) o.img = r3tex(o.proc, 7 + i * 13); }));


    function r3PhotoTex(im, o) {
    const w = im.naturalWidth; let h = im.naturalHeight;
    const mk = (cw, ch) => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };
    if (o.kind === 'cover' || o.kind === 'tile' || o.kind === 'raw_repeat') {
return im.src;
    }
    if (o.kind === 'grid_crop') {
const sx = Math.round(w * 0.082);
const sy = Math.round(h * 0.068);
const sw = Math.round(w * 0.844);
const sh = Math.round(h * 0.633);

const c = mk(sw, sh), g = c.getContext('2d');
g.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);

const idata = g.getImageData(0, 0, sw, sh), d = idata.data;
const rowLum = new Float32Array(sh);
let totalLum = 0;
for (let y = 0; y < sh; y++) {
    let sum = 0;
    for (let x = 0; x < sw; x += 4) {
        const i = (y * sw + x) * 4;
        sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    }
    rowLum[y] = sum / Math.ceil(sw / 4);
    totalLum += rowLum[y];
}
const avgLum = totalLum / sh;
for (let y = 0; y < sh; y++) {
    const gain = rowLum[y] > 10 ? (avgLum / rowLum[y]) : 1;
    for (let x = 0; x < sw; x++) {
        const i = (y * sw + x) * 4;
        d[i] = Math.min(255, d[i] * gain);
        d[i + 1] = Math.min(255, d[i + 1] * gain);
        d[i + 2] = Math.min(255, d[i + 2] * gain);
    }
}
g.putImageData(idata, 0, 0);

o._aspect = sh / sw;
return c.toDataURL('image/png');
    }
    if (o.kind === 'herringbone_stack') {
const diag = Math.ceil(Math.hypot(w, h));
const rotC = mk(diag, diag);
const rg = rotC.getContext('2d');
rg.translate(diag / 2, diag / 2);
rg.rotate(-Math.PI / 4);
rg.drawImage(im, -w / 2, -h / 2, w, h);

const safeSide = Math.round(Math.min(w, h) * 0.34);
const cStart = Math.round((diag - safeSide) / 2);
const pW = Math.max(120, Math.round(safeSide * 0.75));
const pH = Math.max(20, Math.round(pW / 6));

const planks = [];
const shades = [0.93, 1.0, 0.96, 1.03, 0.95, 1.01, 0.92, 0.98, 1.04, 0.97, 0.94, 1.02];
for (let k = 0; k < 12; k++) {
    const sx = cStart + ((k * 19) % Math.max(1, safeSide - pW));
    const sy = cStart + ((k * 23) % Math.max(1, safeSide - pH));
    const pc = mk(pW, pH), pg = pc.getContext('2d');
    pg.filter = `brightness(${shades[k]})`;
    pg.drawImage(rotC, sx, sy, pW, pH, 0, 0, pW, pH);
    pg.filter = 'none';
    planks.push(pc);
}

const W = 34;
const L = W * 6;
const s2 = Math.SQRT1_2;
const halfW = Math.round(L * s2);
const rowW = halfW * 2;
const stepY = Math.round(W / s2);
const cols = 3;
const rows = 18;
const tileW = rowW * cols;
const tileH = stepY * rows;
const outC = mk(tileW, tileH), og = outC.getContext('2d');
const nPl = planks.length;

og.drawImage(planks[0], 0, 0, tileW, tileH);

let idx = 0;
for (let c = 0; c < cols; c++) {
    const x0 = c * rowW;
    const xm = x0 + halfW;
    const x1 = x0 + rowW;

    for (let r = -4; r < rows + 4; r++) {
        const y0 = r * stepY;

        const plL = planks[(((idx * 7 + r * 3 + c) % nPl) + nPl) % nPl];
        og.save();
        og.beginPath();
        og.moveTo(x0, y0 + halfW);
        og.lineTo(xm, y0);
        og.lineTo(xm, y0 + stepY);
        og.lineTo(x0, y0 + halfW + stepY);
        og.closePath();
        og.clip();
        og.translate(x0, y0 + halfW);
        og.rotate(-Math.PI / 4);
        og.drawImage(plL, -10, 0, L + 20, W);
        og.restore();

        const plR = planks[(((idx * 11 + r * 5 + c + 1) % nPl) + nPl) % nPl];
        og.save();
        og.beginPath();
        og.moveTo(xm, y0);
        og.lineTo(x1, y0 + halfW);
        og.lineTo(x1, y0 + halfW + stepY);
        og.lineTo(xm, y0 + stepY);
        og.closePath();
        og.clip();
        og.translate(xm, y0);
        og.rotate(Math.PI / 4);
        og.drawImage(plR, -10, 0, L + 20, W);
        og.restore();

        idx++;
    }
}

o._aspect = tileH / tileW;
return outC.toDataURL('image/png');
    } 
    if (o.kind === 'marble') {
const tw = 512, th = 1024, c = mk(tw * 2, th * 2), g = c.getContext('2d');
const hw = w / 2, hh = h / 2;
[[0, 0], [hw, 0], [0, hh], [hw, hh]].forEach((q, i) => g.drawImage(im, q[0], q[1], hw, hh, (i % 2) * tw, Math.floor(i / 2) * th, tw, th));
g.strokeStyle = 'rgba(120,120,120,0.95)'; g.lineWidth = 5; g.strokeRect(0, 0, c.width, c.height);
g.beginPath(); g.moveTo(tw, 0); g.lineTo(tw, c.height); g.moveTo(0, th); g.lineTo(c.width, th); g.stroke();
return c.toDataURL('image/png');
    }

    const cropH = h;
    const norm = mk(w, cropH), ng = norm.getContext('2d');
    ng.drawImage(im, 0, 0, w, cropH, 0, 0, w, cropH);

    if (!String(o.id || '').startsWith('f-')) {
const idata = ng.getImageData(0, 0, w, cropH), d = idata.data;

let avgR = 0, avgG = 0, avgB = 0, cnt = 0;
for (let i = 0; i < d.length; i += 16) {
    avgR += d[i]; avgG += d[i + 1]; avgB += d[i + 2]; cnt++;
}
avgR /= cnt; avgG /= cnt; avgB /= cnt;
const gray = (avgR + avgG + avgB) / 3;
const gFix = avgG > gray ? (gray / avgG) : 1;

const rowLum = new Float32Array(cropH);
let totalLum = 0;
for (let y = 0; y < cropH; y++) {
    let sum = 0;
    for (let x = 0; x < w; x += 4) {
        const idx = (y * w + x) * 4;
        sum += d[idx] * 0.299 + (d[idx + 1] * gFix) * 0.587 + d[idx + 2] * 0.114;
    }
    rowLum[y] = sum / Math.ceil(w / 4);
    totalLum += rowLum[y];
}
const avgLum = totalLum / cropH;
for (let y = 0; y < cropH; y++) {
    const gain = rowLum[y] > 10 ? (avgLum / rowLum[y]) : 1;
    for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        d[idx] = Math.min(255, d[idx] * gain);
        d[idx + 1] = Math.min(255, d[idx + 1] * gFix * gain);
        d[idx + 2] = Math.min(255, d[idx + 2] * gain);
    }
}
ng.putImageData(idata, 0, 0);
    }
    h = cropH;

    if (o.kind === 'blend') {
const bw = Math.floor(w * 0.12), bh = Math.floor(h * 0.12);
const tw = w - bw, th = h - bh;
const c = mk(tw, th), g = c.getContext('2d');
g.drawImage(norm, 0, 0, tw, th, 0, 0, tw, th);

for (let x = 0; x < bw; x++) {
    g.globalAlpha = 1 - x / bw;
    g.drawImage(norm, tw + x, 0, 1, th, x, 0, 1, th);
}
g.globalAlpha = 1;

const bg = mk(tw, bh), bctx = bg.getContext('2d');
bctx.drawImage(norm, 0, th, tw, bh, 0, 0, tw, bh);
for (let x = 0; x < bw; x++) {
    bctx.globalAlpha = 1 - x / bw;
    bctx.drawImage(norm, tw + x, th, 1, bh, x, 0, 1, bh);
}
for (let y = 0; y < bh; y++) {
    g.globalAlpha = 1 - y / bh;
    g.drawImage(bg, 0, y, tw, 1, 0, y, tw, 1);
}
g.globalAlpha = 1;
return c.toDataURL('image/png');
    }
    if (o.kind === 'y') {
const c = mk(w, h * 2), g = c.getContext('2d');
g.drawImage(norm, 0, 0, w, h);
g.save(); g.translate(0, h * 2); g.scale(1, -1); g.drawImage(norm, 0, 0, w, h); g.restore();
return c.toDataURL('image/png');
    }
    const c = mk(w * 2, h * 2), g = c.getContext('2d');
    g.drawImage(norm, 0, 0, w, h);
    g.save(); g.translate(w * 2, 0); g.scale(-1, 1); g.drawImage(norm, 0, 0, w, h); g.restore();
    g.save(); g.translate(0, h * 2); g.scale(1, -1); g.drawImage(norm, 0, 0, w, h); g.restore();
    g.save(); g.translate(w * 2, h * 2); g.scale(-1, -1); g.drawImage(norm, 0, 0, w, h); g.restore();
    return c.toDataURL('image/png');
}       
function r3LoadPhotos() {
    Object.keys(R3_OPTS).forEach(sf => R3_OPTS[sf].filter(o => o.file).forEach(o => {
const im = new Image();
im.onload = () => {
    try {
        o.img = r3PhotoTex(im, o);
        if (o.kind === 'herringbone_stack' && o._aspect) o.sz2 = Math.round(o.sz * o._aspect);
        if (o.kind === 'y') o.sz2 = Math.round(o.sz * (im.naturalHeight * 2) / im.naturalWidth);
       if (o.kind === 'xy' || o.kind === 'blend' || o.kind === 'raw_repeat') o.sz2 = Math.round(o.sz * im.naturalHeight / im.naturalWidth); 
        if (o.kind === 'grid_crop' && o._aspect) o.sz2 = Math.round(o.sz * o._aspect); 
        r3RenderOpts(); r3Paint();
    } catch (e) {
        o.img = r3tex(r3Solid('#3b1818', 400), 1);
        o.ru = 'Ошибка: ' + e.message;
        r3RenderOpts();
    }
};
im.onerror = () => {
    if (im.src.endsWith('.jpg')) im.src = './images/' + o.file.replace(/\.jpg$/i, '.JPG');
    else if (im.src.endsWith('.JPG')) im.src = './images/' + o.file.replace(/\.jpg$/i, '.jpeg');
};
im.src = './images/' + o.file;
    }));
}


function r3Group(type) { return (type === 'bathroom' || type === 'toilet') ? 'wet' : 'dry'; }
function r3Type(id) { const s = document.getElementById(`type-${id}`); return s ? s.value : 'bedroom'; }
function r3OptionsFor(sf, type) { return R3_OPTS[sf].filter(o => o.rooms.includes(type) && o.img); }
function r3Find(sf, optId) { return R3_OPTS[sf].find(o => o.id === optId); }
function r3Chosen(roomId, sf) {
    const type = r3Type(roomId);
    const m = R3.mat[roomId] || {};
    let o = r3Find(sf, m[sf]);
    if (!o || !o.rooms.includes(type)) o = r3Find(sf, R3_DEFAULT[sf][r3Group(type)]);
    return o;
}
function r3Register(id) {
    const g = r3Group(r3Type(id));
    R3.mat[id] = { floor: R3_DEFAULT.floor[g], wall: R3_DEFAULT.wall[g], ceil: R3_DEFAULT.ceil[g] };
    r3SetActive(id);
}
function r3Unregister(id) {
    delete R3.mat[id];
    delete R3.furniture[id];
    if (String(R3.active) === String(id)) {
        const first = document.querySelector('#rooms-container .room-card');
        R3.active = null;
        if (first) r3SetActive(first.id.replace('room-', ''));
    }
    r3RenderChips();
}
function r3OnTypeChange(id) {
    const type = r3Type(id), g = r3Group(type), m = R3.mat[id] || (R3.mat[id] = {});
    ['floor', 'wall', 'ceil'].forEach(sf => {
        const o = r3Find(sf, m[sf]);
        if (!o || !o.rooms.includes(type)) m[sf] = R3_DEFAULT[sf][g];
    });
    r3RenderChips();
    if (String(R3.active) === String(id)) { r3Paint(); r3RenderOpts(); }
}
function r3OnDimChange(id) { if (String(R3.active) === String(id)) r3Layout(); }
function r3SetActive(id) {
    id = String(id);
    if (R3.active === id) return;
    R3.active = id;
    document.querySelectorAll('#rooms-container .room-card').forEach(c => c.classList.toggle('r3-active', c.id === 'room-' + id));
    r3RenderChips(); r3Layout(); r3Paint(); r3RenderOpts();
}
function r3RenderChips() {
    const box = document.getElementById('r3-chips'); if (!box) return;
    const cards = document.querySelectorAll('#rooms-container .room-card');
    box.innerHTML = '';
    cards.forEach((c, i) => {
        const id = c.id.replace('room-', '');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'r3-chip';
        b.setAttribute('aria-pressed', String(R3.active) === id);
        b.textContent = `#${i + 1} ${roomTypes[r3Type(id)]}`;
        b.onclick = () => r3SetActive(id);
        box.appendChild(b);
    });
    box.style.display = cards.length > 1 ? 'flex' : 'none';
    const sub = document.getElementById('r3-sub');
    if (sub) {
        const idx = Array.prototype.findIndex.call(cards, c => c.id === 'room-' + R3.active);
        sub.textContent = idx >= 0 ? `${roomTypes[r3Type(R3.active)]} (#${idx + 1}): pol, devor, shift va mebelni tanlang / выберите отделку и мебель` : '';
    }
}

function r3RenderOpts() {
    const box = document.getElementById('r3-opts'); if (!box || R3.active === null) return;
    const sf = R3.tab, type = r3Type(R3.active);
    box.innerHTML = '';

    if (sf === 'furniture') {
        const curFurnId = R3.furniture[R3.active] || null;

        const noneBtn = document.createElement('button');
        noneBtn.type = 'button'; noneBtn.className = 'r3-opt';
        noneBtn.setAttribute('aria-pressed', !curFurnId);
        noneBtn.innerHTML = `<div class="sw" style="background:#1E293B; display:flex; align-items:center; justify-content:center; font-size:24px;">🚫</div><b>Bosh (mebelsiz)</b><span>Без мебели</span>`;
        noneBtn.onclick = () => { R3.furniture[R3.active] = null; r3Paint(); r3RenderOpts(); };
        box.appendChild(noneBtn);

        let available = [];
        huvaydoCatalog.forEach(cat => {
            if (cat.type === type || (type === 'bedroom' && cat.type === 'bedroom_set') || (type === 'child' && cat.type === 'bedroom_set')) {
                available = available.concat(cat.items);
            }
        });

        available.forEach(item => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'r3-opt';
            b.setAttribute('aria-pressed', curFurnId === item.id);
            const thumb = item.coverImg || (item.images && item.images[0]) || '';
            b.innerHTML = `<div class="sw" style="background-image:url('${thumb}')"></div><b>${item.name}</b><span>${item.material || 'Mebel'}</span>`;
            b.onclick = () => { R3.furniture[R3.active] = item.id; r3Paint(); r3RenderOpts(); };
            box.appendChild(b);
        });
        return;
    }

    const cur = r3Chosen(R3.active, sf);
    r3OptionsFor(sf, type).forEach(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'r3-opt'; b.setAttribute('aria-pressed', cur && cur.id === o.id);
        b.innerHTML = `<div class="sw" style="background-image:url(${o.img})"></div><b>${o.uz}</b><span>${o.ru}</span>`;
        b.onclick = () => { R3.mat[R3.active][sf] = o.id; r3Paint(); r3RenderOpts(); };
        box.appendChild(b);
    });
}

function r3Paint() {
    if (R3.active === null) return;
    ['floor', 'wall', 'ceil'].forEach(sf => {
        const o = r3Chosen(R3.active, sf); if (!o || !o.img) return;
        R3_FACES[sf].forEach(fid => {
            const el = document.getElementById(fid); if (!el) return;
            const sh = R3_SHADE[fid.replace('r3-', '')] || 0;
            
            el.style.backgroundImage = `linear-gradient(rgba(0,0,0,${sh}),rgba(0,0,0,${sh})),url(${o.img})`;
            
         const mult = (o.kind === 'xy') ? 6 : 3;
    if (o.kind === 'cover') {
        // Если явно указан sz — включаем repeat с этим размером
        if (o.sz) {
            el.style.backgroundRepeat = 'repeat';
            el.style.backgroundSize = `auto,${o.sz * 3}px ${(o.sz2 || o.sz) * 3}px`;
        } else {
            // Если sz нет — растягиваем на всю стену без повторов
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';
            el.style.backgroundSize = '100% 100%';
        }
    } else {
        el.style.backgroundRepeat = 'repeat';
        el.style.backgroundSize = `auto,${o.sz * mult}px ${(o.sz2 || o.sz) * mult}px`;
    } 
        });
    });

    const furnEl = document.getElementById('r3-furniture');
    if (furnEl) {
        const furnId = R3.furniture[R3.active];
        let furnItem = null;
        if (furnId) {
            huvaydoCatalog.forEach(cat => {
                cat.items.forEach(it => { if (it.id === furnId) furnItem = it; });
            });
        }
        if (furnItem && furnItem.glb) {
    furnEl.style.backgroundImage = 'none';
    furnEl.style.display = 'none';
    setRoom3DModel(furnItem);
} else if (furnItem) {
    setRoom3DModel(null);
    const furnImg = furnItem.coverImg || (furnItem.images && furnItem.images[0]);
    furnEl.style.backgroundImage = `url('${furnImg}')`;
    furnEl.style.display = 'block';
} else {
    setRoom3DModel(null);
    furnEl.style.backgroundImage = 'none';
    furnEl.style.display = 'none';
}
    }
}

const R3_PPM = 300;
function r3Dims() {
    const id = R3.active;
    const num = (name, lo, hi, d) => { const e = document.getElementById(`${name}-${id}`); const v = e ? parseFloat(String(e.value).replace(',', '.')) : NaN; return isNaN(v) ? d : Math.max(lo, Math.min(hi, v)); };
    return { l: num('length', 1.5, 12, 4), w: num('width', 1.5, 12, 3.5), h: num('height', 2, 5, 2.7) };
}
function r3Layout() {
    const room = document.getElementById('r3-room'); if (!room || R3.active === null) return;
    const d = r3Dims(), W = d.w * R3_PPM, D = d.l * R3_PPM, H = d.h * R3_PPM;
    const set = (id, w, h, tf) => { const e = document.getElementById(id); if(!e) return; e.style.width = w + 'px'; e.style.height = h + 'px'; e.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`; e.style.transform = tf; };
    set('r3-back', W, H, `translateZ(${-D / 2}px)`);
    set('r3-left', D, H, `translateX(${-W / 2}px) rotateY(90deg)`);
    set('r3-right', D, H, `translateX(${W / 2}px) rotateY(-90deg)`);
    set('r3-floor', W, D, `translateY(${H / 2}px) rotateX(90deg)`);
    set('r3-ceil', W, D, `translateY(${-H / 2}px) rotateX(-90deg)`);

    const furn = document.getElementById('r3-furniture');
    if (furn) {
        furn.style.width = W + 'px';
        furn.style.height = H + 'px';
        furn.style.margin = `${-H / 2}px 0 0 ${-W / 2}px`;
        furn.style.transform = `translateZ(${-D / 2 + 2}px)`;
    }

    const st = document.getElementById('r3-stage'), full = st.classList.contains('full');
    const S = full ? window.innerWidth : (st.clientWidth || 392);
    const maxH = full ? window.innerHeight : Math.min(0.8 * window.innerHeight, 1000);
    const k = S / 392, H0 = Math.max(300, Math.min(400 * k, maxH));
    R3.kk = Math.min(k, H0 / 400);
    const sc = document.getElementById('r3-scene');
    sc.style.height = (full ? window.innerHeight : H0) + 'px';
    sc.style.perspective = (1050 * R3.kk) + 'px';
    R3.fit = Math.max(0.13, Math.min(0.55, 360 / Math.max(W, D))) * R3.kk * (full ? 0.85 : 0.92);
    r3Apply();
}
function r3Apply() {
    const room = document.getElementById('r3-room'); if (!room) return;
    const s2 = R3.fit * R3.zoom, D = r3Dims().l * R3_PPM;
    room.style.transform = `translateZ(${420 * R3.kk - s2 * D / 2}px) scale(${s2}) rotateX(${R3.pitch}deg) rotateY(${R3.yaw}deg)`;
}
function r3Init() {
    const st = document.getElementById('r3-stage');
    document.getElementById('r3-tabs').addEventListener('click', e => {
        const t = e.target.closest('.r3-tab'); if (!t) return;
        R3.tab = t.dataset.s;
        document.querySelectorAll('.r3-tab').forEach(x => x.setAttribute('aria-selected', x === t));
        r3RenderOpts();
    });
    document.getElementById('r3-z').addEventListener('input', e => { R3.zoom = parseFloat(e.target.value); r3Apply(); });
    document.getElementById('r3-fs').addEventListener('click', e => {
        e.stopPropagation();
        const on = st.classList.toggle('full');
        e.target.textContent = on ? '✕ Yopish / Закрыть' : '⛶ Katta / Крупно';
        r3Layout();
    });
    st.addEventListener('pointerdown', e => { if (e.target.closest('#r3-fs')) return; R3.drag = { x: e.clientX, y: e.clientY, yaw: R3.yaw, pitch: R3.pitch }; st.setPointerCapture(e.pointerId); });
    st.addEventListener('pointermove', e => {
        if (!R3.drag) return;
        R3.yaw = Math.max(-65, Math.min(65, R3.drag.yaw + (e.clientX - R3.drag.x) * 0.4));
        R3.pitch = Math.max(-45, Math.min(45, R3.drag.pitch - (e.clientY - R3.drag.y) * 0.35));
        r3Apply();
    });
    ['pointerup', 'pointercancel'].forEach(ev => st.addEventListener(ev, () => { R3.drag = null; }));
    window.addEventListener('resize', r3Layout);
    if (window.ResizeObserver) new ResizeObserver(() => r3Layout()).observe(st);
    r3LoadPhotos();
}
