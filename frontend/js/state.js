/* Global holat va xona turlari */
let roomCounter = 0;
let catalogScrollPosition = 0;
let roomsData = [];
let currentOrderAction = null;
let activeItemData = null;

const roomTypes = {
    bedroom: "Yotoqxona / Спальня",
    living_room: "Mehmonxona / Гостиная",
    kitchen: "Oshxona / Кухня",
    bathroom: "Vannaxona / Ванная",
    toilet: "Hojatxona / Туалет",
    child: "Bolalar xonasi / Детская комната",
    hallway: "Dahliz / Koridor / Прихожая"
};

// Katalog data/catalog.json dan yuklanadi
let huvaydoCatalog = [];
fetch('data/catalog.json')
    .then(r => r.json())
    .then(d => { huvaydoCatalog = d; })
    .catch(e => console.warn('Katalog yuklanmadi:', e));

let currentSlideIndex = 0;
let currentItemImages = [];
