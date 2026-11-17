/* Three.js: 3D mebel yuklash */
let threeScene, threeCamera, threeRenderer, activeModel3D = null, currentLoadedGlb = null;

const gltfLoader = (typeof THREE !== 'undefined' && THREE.GLTFLoader) ? new THREE.GLTFLoader() : null;
if (gltfLoader && THREE.DRACOLoader) {
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
    gltfLoader.setDRACOLoader(dracoLoader);
}

function initThreeFurniture() {
    const container = document.getElementById('r3-scene');
    const canvas = document.getElementById('three-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    threeCamera.position.set(0, 1.2, 3.5);

    threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    threeRenderer.setSize(container.clientWidth, container.clientHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    threeScene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(2, 5, 3);
    threeScene.add(dirLight);

    function animate() {
        requestAnimationFrame(animate);
        if (typeof R3 !== 'undefined' && activeModel3D) {
            const yawRad = (R3.yaw || 0) * (Math.PI / 180);
            const pitchRad = (R3.pitch || 0) * (Math.PI / 180);

            activeModel3D.rotation.order = 'YXZ';
            activeModel3D.rotation.y = yawRad;
            activeModel3D.rotation.x = -pitchRad;

            const z = R3.zoom || 1;
            activeModel3D.scale.set(z, z, z);
        }
        threeRenderer.render(threeScene, threeCamera);
    }
    animate();

    window.addEventListener('resize', () => {
        if (!container) return;
        threeCamera.aspect = container.clientWidth / container.clientHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function setRoom3DModel(item) {
    if (!threeScene || !gltfLoader) return;

    if (!item || !item.glb) {
        if (activeModel3D) {
            threeScene.remove(activeModel3D);
            activeModel3D = null;
            currentLoadedGlb = null;
        }
        return;
    }

    const isSameGlb = (currentLoadedGlb === item.glb);
    currentLoadedGlb = item.glb;

    const placeModel = (raw) => {
        raw.rotation.set(0, 0, 0);
        raw.scale.set(1, 1, 1);
        raw.position.set(0, 0, 0);
        raw.updateMatrixWorld(true);

        let box = new THREE.Box3().setFromObject(raw);
        let size = box.getSize(new THREE.Vector3());

        // Если модель экспортирована лёжа (Z больше Y — как на видео), поднимаем её вертикально
        if (size.z > size.y * 1.2) {
            raw.rotation.x = -Math.PI / 2;
            raw.updateMatrixWorld(true);
            box.setFromObject(raw);
            size = box.getSize(new THREE.Vector3());
        }

        // Если длинная сторона модели смотрит в глубину (Z > X), разворачиваем её вдоль дальней стены (X)
        if (size.z > size.x) {
            raw.rotation.y += Math.PI / 2;
            raw.updateMatrixWorld(true);
            box.setFromObject(raw);
            size = box.getSize(new THREE.Vector3());
        }

        const d = (typeof r3Dims === 'function') ? r3Dims() : { l: 4, w: 3.5, h: 2.7 };
        const roomW = 2.30 * (d.w / 3.5);
        const roomH = 1.08 * (d.h / 2.7);
        const roomHalfD = 1.15 * (d.l / 4.0);

        // Ширина — во всю дальнюю стену, высота — от пола до потолка, глубина — реальные ~0.42 (без растяжения на полкомнаты)
        const targetW = roomW * 0.96;
        const targetH = roomH * 0.96;
        const targetD = 0.42;

        raw.scale.set(
            targetW / (size.x || 1),
            targetH / (size.y || 1),
            targetD / (size.z || 1)
        );
        raw.updateMatrixWorld(true);

        box.setFromObject(raw);
        const center = box.getCenter(new THREE.Vector3());

        // Ставим по центру дальней стены, спиной вплотную к стене, низом на пол
        raw.position.set(
            -center.x,
            -box.min.y - (roomH / 2),
            -box.min.z - roomHalfD + 0.02
        );

        if (activeModel3D) {
            while (activeModel3D.children.length) activeModel3D.remove(activeModel3D.children[0]);
            activeModel3D.add(raw);
        } else {
            activeModel3D = new THREE.Group();
            activeModel3D.position.set(0, 0, 0);
            activeModel3D.add(raw);
            threeScene.add(activeModel3D);
        }
    };

    if (isSameGlb && activeModel3D && activeModel3D.children.length) {
        placeModel(activeModel3D.children[0]);
        return;
    }

    gltfLoader.load(
        item.glb,
        (gltf) => {
            if (activeModel3D) threeScene.remove(activeModel3D);
            activeModel3D = null;
            placeModel(gltf.scene);
        },
        undefined,
        (err) => console.warn("Ошибка загрузки GLB:", item.glb, err)
    );
}
document.addEventListener("DOMContentLoaded", initThreeFurniture);
