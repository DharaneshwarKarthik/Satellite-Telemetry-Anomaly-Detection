import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// -----------------------------
// CONFIG
// -----------------------------
const TELEMETRY_INTERVAL = 500;
let telemetryValue = 0;
let isAnomaly = false;

// -----------------------------
// THREE.JS SETUP
// -----------------------------
const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(10, 10, 10);
scene.add(sunLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Earth
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('./earth.png');
const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Starfield
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const starVertices = [];
for (let i = 0; i < 5000; i++) {
    starVertices.push(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
    );
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
scene.add(new THREE.Points(starGeometry, starMaterial));

// Satellite
const satelliteGroup = new THREE.Group();
const satBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
satBody.rotation.x = Math.PI / 2;
satelliteGroup.add(satBody);

const panel = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.05, 1),
    new THREE.MeshStandardMaterial({ color: 0x002244 })
);
satelliteGroup.add(panel);

scene.add(satelliteGroup);

// Signal beam
const signalBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.2, 1, 8),
    new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0 })
);
scene.add(signalBeam);

// -----------------------------
// ANIMATION LOOP
// -----------------------------
let orbitAngle = 0;
const orbitRadius = 18;

function animate() {
    requestAnimationFrame(animate);

    orbitAngle += 0.005;
    satelliteGroup.position.x = Math.cos(orbitAngle) * orbitRadius;
    satelliteGroup.position.z = Math.sin(orbitAngle) * orbitRadius;
    satelliteGroup.lookAt(0, 0, 0);

    earth.rotation.y += 0.001;

    if (isAnomaly) {
        signalBeam.visible = true;
        signalBeam.material.opacity = 0.5 + Math.sin(Date.now() * 0.02) * 0.4;

        const satPos = satelliteGroup.position;
        signalBeam.position.set(satPos.x * 0.6, satPos.y * 0.6, satPos.z * 0.6);
        signalBeam.lookAt(satPos);
        signalBeam.scale.y = orbitRadius * 0.8;
    } else {
        signalBeam.visible = false;
    }

    controls.update();
    renderer.render(scene, camera);
}

// -----------------------------
// UI ELEMENTS
// -----------------------------
const logContainer = document.getElementById('telemetry-log');
const statCurrent = document.getElementById('stat-current');
const hudOverlay = document.getElementById('hud-overlay');
const globalStatus = document.getElementById('global-status');
const signalStrength = document.getElementById('signal-strength');
const signalMessage = document.getElementById('signal-message');
const chartCanvas = document.getElementById('telemetry-chart');
const chartCtx = chartCanvas.getContext('2d');

const history = [];
const maxHistory = 50;

// -----------------------------
// CHART
// -----------------------------
function drawChart() {
    const w = chartCanvas.width = chartCanvas.clientWidth;
    const h = chartCanvas.height = chartCanvas.clientHeight;

    chartCtx.clearRect(0, 0, w, h);

    if (history.length < 2) return;

    chartCtx.strokeStyle = isAnomaly ? '#ff3e3e' : '#00f2ff';
    chartCtx.lineWidth = 2;
    chartCtx.beginPath();

    const step = w / (maxHistory - 1);

    history.forEach((val, i) => {
        const x = i * step;
        const y = h - (val * h);
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });

    chartCtx.stroke();
}

// -----------------------------
// LOAD MODEL OUTPUT
// -----------------------------
let data = [];
let index = 0;

async function loadData() {
    const response = await fetch('./results.json');
    data = await response.json();
    console.log("✅ Loaded model results:", data.length);

    runSimulation();
}

// -----------------------------
// MAIN LOOP (REAL DATA)
// -----------------------------
function runSimulation() {
    setInterval(() => {
        if (index >= data.length) index = 0;

        const item = data[index];

        // Normalize score for chart (important)
        telemetryValue = item.score / 50;

        isAnomaly = item.status === "ANOMALY";

        history.push(telemetryValue);
        if (history.length > maxHistory) history.shift();

        // UI updates
        statCurrent.innerText = item.score.toFixed(4);
        drawChart();

        const entry = document.createElement('div');
        entry.className = `log-entry ${isAnomaly ? 'anomaly' : ''}`;
        entry.innerHTML = `
            <span>${new Date().toLocaleTimeString()}</span>
            <span>Score: ${item.score.toFixed(2)}</span>
        `;
        logContainer.prepend(entry);

        if (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.lastChild);
        }

        // ALERT LOGIC
        if (isAnomaly) {
            hudOverlay.classList.remove('hidden');

            globalStatus.innerHTML =
                '<span class="pulse-dot" style="background:#ff3e3e"></span> ANOMALY ALERT';
            globalStatus.style.color = '#ff3e3e';

            signalStrength.style.width = '100%';
            signalMessage.innerText = 'Transmitting Anomaly Signal...';

        } else {
            hudOverlay.classList.add('hidden');

            globalStatus.innerHTML =
                '<span class="pulse-dot"></span> SYSTEM NOMINAL';
            globalStatus.style.color = '#00f2ff';

            signalStrength.style.width = '0%';
            signalMessage.innerText = 'No active transmission';
        }

        index++;

    }, TELEMETRY_INTERVAL);
}

// -----------------------------
// START EVERYTHING
// -----------------------------
loadData();
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});