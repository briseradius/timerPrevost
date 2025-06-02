let displayWindow = null;
let paused = false;

function launchDisplay() {
  displayWindow = window.open("display.html", "ChronoAffichage", "width=800,height=600");
}

function startScenario(type) {
  if (!displayWindow) return alert("Ouvre d'abord la fenêtre d'affichage.");
  const scenarios = {
    escrime: [60],
    behourd: [60, 30, 60],
    profight1: [120, 60, 120, 60, 120],
    profight2: [180, 60, 180, 60, 180]
  };
  paused = false;
  document.getElementById("pauseBtn").textContent = "Pause";
  displayWindow.postMessage({ action: "start", durations: scenarios[type] }, "*");
}

function pauseResume() {
  if (!displayWindow) return;
  paused = !paused;
  const pauseBtn = document.getElementById("pauseBtn");
  if (paused) {
    pauseBtn.textContent = "Reprendre";
    pauseBtn.classList.remove("pause");
    pauseBtn.classList.add("play");
  } else {
    pauseBtn.textContent = "Pause";
    pauseBtn.classList.remove("play");
    pauseBtn.classList.add("pause");
  }
  displayWindow.postMessage({ action: paused ? "pause" : "resume" }, "*");
}


function reset() {
  if (!displayWindow) return;
  paused = false;
  document.getElementById("pauseBtn").textContent = "Pause";
  displayWindow.postMessage({ action: "reset" }, "*");
}
function startCustom() {
  const min = parseInt(document.getElementById('customMin').value, 10) || 0;
  const sec = parseInt(document.getElementById('customSec').value, 10) || 0;
  const total = min * 60 + sec;
  if (total > 0 && displayWindow) {
    paused = false;
    document.getElementById("pauseBtn").textContent = "Pause";
    displayWindow.postMessage({ action: "start", durations: [total] }, "*");
  } else {
    alert("Merci de saisir une durée supérieure à 0.");
  }
}


