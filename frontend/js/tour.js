/* CSS 3D kinematik tur */
let isTourActive = false;

function startDroneTour() {
    if (typeof gsap === 'undefined' || typeof R3 === 'undefined') return;
    if (isTourActive) return;

    isTourActive = true;
    const btn = document.getElementById('btn-drone-tour');
    if (btn) btn.innerText = "🚁 Полет...";

    const tourObj = {
        yaw: Number(R3.yaw) || -22,
        pitch: Number(R3.pitch) || -2,
        zoom: Number(R3.zoom) || 1
    };

    const tl = gsap.timeline({
        onComplete: () => {
            isTourActive = false;
            if (btn) btn.innerText = "🛸 Путешествие / Sayohat";
        }
    });

    function applyFrame() {
        R3.yaw = tourObj.yaw;
        R3.pitch = tourObj.pitch;
        R3.zoom = tourObj.zoom;
        
        const zInput = document.getElementById('r3-z');
        if (zInput) zInput.value = tourObj.zoom;

        if (typeof r3Apply === 'function') {
            r3Apply();
        }
    }

    tl
    // 1. Приближаемся ВПЛОТНУЮ к центральной стене (~30 см)
    .to(tourObj, { yaw: 0, pitch: 0, zoom: 5.2, duration: 3.5, ease: "power2.inOut", onUpdate: applyFrame })
    
    // 2. РАЗВОРАЧИВАЕМ ОБЪЕКТИВ ВВЕРХ К ПОТОЛКУ (крупный план)
    .to(tourObj, { yaw: 0, pitch: 80, zoom: 3.2, duration: 3.5, ease: "power2.inOut", onUpdate: applyFrame })
    
    // 3. ОПУСКАЕМ ОБЪЕКТИВ ВНИЗ К ПОЛУ ВПЛОТНУЮ (pitch: -75, zoom: 4.5)
    .to(tourObj, { yaw: -15, pitch: -75, zoom: 4.5, duration: 4, ease: "power2.inOut", onUpdate: applyFrame })
    
    // 4. Панорама пола под другим углом вблизи
    .to(tourObj, { yaw: 20, pitch: -65, zoom: 4.0, duration: 3.5, ease: "power1.inOut", onUpdate: applyFrame })
    
    // 5. Плавный отлёт назад к общему виду всей комнаты
    .to(tourObj, { yaw: -22, pitch: -2, zoom: 1.0, duration: 4, ease: "power3.out", onUpdate: applyFrame });
}

// Принудительно привязываем клик мыши на ПК
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById('btn-drone-tour');
    if (btn) {
        ['click', 'pointerdown'].forEach(evt => {
            btn.addEventListener(evt, function(e) {
                e.stopPropagation();
                startDroneTour();
            }, { passive: true });
        });
    }
});
