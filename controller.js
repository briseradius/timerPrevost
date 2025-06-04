let displayWindow = null;
let paused = false;
let lastScenario = null;
let lastCustom = null;
let currentDurations = null;
let isRunning = false;

// Garde le temps restant pour afficher dans le petit chrono
let currentTimeLeft = 0;

function launchDisplay() {
  if (!displayWindow || displayWindow.closed) {
    displayWindow = window.open("display.html", "ChronoAffichage", "width=800,height=600");
  } else {
    displayWindow.focus();
  }
}

function startScenario(type) {
  if (!displayWindow) return alert("Ouvre d'abord la fenêtre d'affichage.");

  const scenarios = {
    behourd: [60, 30, 60],
    profight1: [120, 60, 120, 60, 120],
    profight2: [180, 60, 180, 60, 180]
  };

  paused = false;
  isRunning = true;
  currentDurations = scenarios[type];
  lastScenario = type;
  lastCustom = null;
  document.getElementById("pauseBtn").textContent = "Pause";

  displayWindow.postMessage({ action: "start", durations: currentDurations }, "*");
}

function startCustom() {
  const min = parseInt(document.getElementById('customMin').value, 10) || 0;
  const sec = parseInt(document.getElementById('customSec').value, 10) || 0;
  const duration = [min * 60 + sec];

  if (!displayWindow) return alert("Ouvre d'abord la fenêtre d'affichage.");

  paused = false;
  isRunning = true;
  currentDurations = duration;
  lastScenario = null;
  lastCustom = `${min}-${sec}`;
  document.getElementById("pauseBtn").textContent = "Pause";

  displayWindow.postMessage({ action: "start", durations: currentDurations, isCustom: true }, "*");
}

function pauseOrResume() {
  if (!displayWindow) return;

  if (!isRunning) return; // Si rien ne tourne, ne fait rien

  paused = !paused;
  displayWindow.postMessage({ action: paused ? "pause" : "resume" }, "*");
  document.getElementById("pauseBtn").textContent = paused ? "Reprendre" : "Pause";
}

function resetOrReplay() {
  if (!displayWindow) return alert("Ouvre d'abord la fenêtre d'affichage.");

  if (currentDurations) {
    paused = false;
    document.getElementById("pauseBtn").textContent = "Pause";
    displayWindow.postMessage({ action: "start", durations: currentDurations }, "*");
  } else if (lastScenario) {
    startScenario(lastScenario);
  } else if (lastCustom) {
    const [min, sec] = lastCustom.split("-").map(Number);
    document.getElementById('customMin').value = min;
    document.getElementById('customSec').value = sec;
    startCustom();
  } else {
    alert("Aucune séquence à relancer.");
  }
}

// Reçoit les messages de la fenêtre d'affichage pour mettre à jour le petit chrono
window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.action === "timeUpdate") {
    currentTimeLeft = event.data.timeLeft;

    // Met à jour le petit chrono en format mm:ss
    document.getElementById("smallChrono").textContent = formatTime(currentTimeLeft);
  }
});

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m.toString().padStart(2, '0') + ":" + sec.toString().padStart(2, '0');
}
