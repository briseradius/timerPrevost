let steps = [];
let currentStep = 0;
let timer = null;
let timeLeft = 0;
let totalTime = 0;
let elapsed = 0;
let paused = false;
let inStopPhase = false;

const display = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m.toString().padStart(2, '0') + ":" + sec.toString().padStart(2, '0');
}

function updateProgress() {
  const percent = 100 - (elapsed / totalTime) * 100;
  progressBar.style.width = percent + "%";

  if (timeLeft <= 10) {
    display.style.color = display.style.color === "red" ? "white" : "red";
    progressBar.style.backgroundColor = "red";
  } else if (timeLeft <= 30) {
    progressBar.style.backgroundColor = "orange";
  } else {
    progressBar.style.backgroundColor = "green";
  }
}

function showIntermediateStop(callback) {
  inStopPhase = true;
  let stopSeconds = 5;
  display.textContent = "STOP";
  display.style.color = "red";
  progressBar.style.width = "0%";
  progressBar.style.backgroundColor = "red";

  const stopStart = Date.now();

  const stopTimer = setInterval(() => {
    if (!paused) {
      const elapsed = Math.floor((Date.now() - stopStart) / 1000);

      if (elapsed >= 5) {
        clearInterval(stopTimer);
        display.style.visibility = "visible";
        display.style.color = "white";
        inStopPhase = false;
        callback();
        return;
      }

      // Clignotement rapide pendant les 2 dernières secondes (soit à partir de 3 secondes écoulées)
      if (elapsed >= 3) {
        display.style.visibility = (display.style.visibility === "hidden") ? "visible" : "hidden";
      } else {
        display.style.visibility = "visible";
      }
    }
  }, 100); // ← 100ms = 10 fois par seconde
}


function runStep() {
  if (currentStep >= steps.length) {
    display.textContent = "STOP";
    display.style.visibility = "visible";
    display.style.color = "red";
    progressBar.style.width = "0%";
    progressBar.style.backgroundColor = "red";
    return;
  }

  timeLeft = steps[currentStep];
  totalTime = timeLeft;
  elapsed = 0;
  display.style.color = "white";
  display.textContent = formatTime(timeLeft);

  timer = setInterval(() => {
    if (!paused) {
      timeLeft--;
      elapsed++;
      display.textContent = formatTime(timeLeft);
      updateProgress();

      if (timeLeft <= 0) {
        clearInterval(timer);
        showIntermediateStop(() => {
          currentStep++;
          runStep();
        });
      }
    }
  }, 1000);
}

window.addEventListener("message", (e) => {
  const { action, durations } = e.data;
  if (action === "start") {
    clearInterval(timer);
    steps = durations;
    currentStep = 0;
    runStep();
  } else if (action === "pause") {
    paused = true;
  } else if (action === "resume") {
    paused = false;
  } else if (action === "reset") {
    clearInterval(timer);
    steps = [];
    currentStep = 0;
    timeLeft = 0;
    totalTime = 0;
    elapsed = 0;
    inStopPhase = false;
    display.textContent = "00:00";
    display.style.visibility = "visible";
    progressBar.style.width = "100%";
    progressBar.style.backgroundColor = "green";
    display.style.color = "white";
  }
});
