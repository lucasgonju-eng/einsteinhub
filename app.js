const video = document.getElementById("bgVideoMain");
const root = document.documentElement;
const orbitLayer = document.getElementById("orbitLayer");

const projects = [
  { name: "Portal Einstein", url: "https://portaleinstein.com.br" },
  { name: "Liga Einstein", url: "https://ligaeinstein.com.br" },
  { name: "Diárias Village", url: "https://village.einsteinhub.co" },
  { name: "InGenium", url: "https://ingenium.einsteinhub.co" },
  { name: "E-docs" },
  { name: "PedidoPro" }
];

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let gyroEnabled = false;
const maxOffsetX = 22;
const maxOffsetY = 14;
const smoothness = 0.005;
let activeCardTimeoutId = null;

function applyOrbitCenterOffset() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobile = window.innerWidth <= 768;
  const offsetX = isMobile && isPortrait ? -52 : 0;
  const offsetY = isMobile && isPortrait ? -20 : 0;
  root.style.setProperty("--ox", `${offsetX}px`);
  root.style.setProperty("--oy", `${offsetY}px`);
}

function buildOrbitCards() {
  const isMobile = window.innerWidth <= 768;
  const orbitRadius = isMobile ? 134 : 265;
  const orbitSpeed = isMobile ? 320 : 380;

  orbitLayer.innerHTML = "";
  projects.forEach((project, index) => {
    const angle = (360 / projects.length) * index;
    const delay = "0s";

    const item = document.createElement("article");
    item.className = "orbit-item";
    item.style.setProperty("--angle", `${angle}deg`);
    item.style.setProperty("--radius", `${orbitRadius}px`);
    item.style.setProperty("--speed", `${orbitSpeed}s`);
    item.style.setProperty("--delay", delay);

    const tag = project.url ? "a" : "div";
    const href = project.url ? ` href="${project.url}" target="_blank" rel="noopener noreferrer"` : "";
    const linkClass = project.url ? " orbit-card--link" : "";

    item.innerHTML = `
      <${tag} class="orbit-card${linkClass}"${href}>
        <h3>${project.name}</h3>
      </${tag}>
    `;

    orbitLayer.appendChild(item);
  });
}

function setupCardInteractions() {
  orbitLayer.addEventListener("pointerdown", (event) => {
    const card = event.target.closest(".orbit-card");
    if (!card) return;
    card.classList.add("is-active");
    if (activeCardTimeoutId) {
      clearTimeout(activeCardTimeoutId);
    }
    activeCardTimeoutId = window.setTimeout(() => {
      card.classList.remove("is-active");
      activeCardTimeoutId = null;
    }, 950);
  });
}

function syncPortraitClass() {
  const isPortrait = window.innerHeight > window.innerWidth;
  document.body.classList.toggle("portrait-video", isPortrait);
}

function normalizedToOffset(nx, ny) {
  targetX = nx * maxOffsetX;
  targetY = ny * maxOffsetY;
}

function updateFromInput(nx, ny) {
  normalizedToOffset(nx, ny);
}

function pointerHandler(event) {
  const nx = (event.clientX / window.innerWidth) * 2 - 1;
  const ny = (event.clientY / window.innerHeight) * 2 - 1;
  updateFromInput(nx, ny);
}

window.addEventListener("pointermove", pointerHandler);
window.addEventListener("resize", () => {
  syncPortraitClass();
  applyOrbitCenterOffset();
  buildOrbitCards();
}, { passive: true });
window.addEventListener("orientationchange", () => {
  syncPortraitClass();
  applyOrbitCenterOffset();
  buildOrbitCards();
}, { passive: true });

function orientationHandler(event) {
  const beta = Math.max(-30, Math.min(30, event.beta || 0));
  const gamma = Math.max(-30, Math.min(30, event.gamma || 0));
  const nx = gamma / 30;
  const ny = beta / 30;
  updateFromInput(nx, ny);
}

async function tryEnableGyro() {
  if (gyroEnabled) return;
  try {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") return;
    }
    window.addEventListener("deviceorientation", orientationHandler, { passive: true });
    gyroEnabled = true;
  } catch (_) {}
}

window.addEventListener("pointerdown", tryEnableGyro, { passive: true });
window.addEventListener("touchstart", tryEnableGyro, { passive: true });

function render() {
  currentX += (targetX - currentX) * smoothness;
  currentY += (targetY - currentY) * smoothness;
  root.style.setProperty("--mx", `${currentX}px`);
  root.style.setProperty("--my", `${currentY}px`);
  root.style.setProperty("--fx", `${currentX * 0.55}px`);
  root.style.setProperty("--fy", `${currentY * 0.55}px`);
  requestAnimationFrame(render);
}

syncPortraitClass();
applyOrbitCenterOffset();
buildOrbitCards();
setupCardInteractions();
render();
