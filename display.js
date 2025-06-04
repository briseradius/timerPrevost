let steps = [];
let currentStep = 0;
let timer = null;
let timeLeft = 0;
let totalTime = 0;
let elapsed = 0;
let paused = false;
let inStopPhase = false;
let isCustom = false;

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
    display.style.color = "white";
  } else {
    progressBar.style.backgroundColor = "green";
    display.style.color = "white";
  }
}

function shouldHaveStopPhase(current, next) {
  if ((current === 120 || current === 180) && next === 60) return true;
  if (current === 60 && next === 30) return true;
  return false;
}

function showIntermediateStop(callback, forceStop = false) {
  inStopPhase = true;
  const stopSeconds = 5;

  const previousDuration = steps[currentStep - 1];
  const nextDuration = steps[currentStep];

  let message = "GO";
  let color = "limegreen";

  if (forceStop || shouldHaveStopPhase(previousDuration, nextDuration)) {
    message = "STOP";
    color = "red";
  }

  display.textContent = message;
  display.style.color = color;
  progressBar.style.width = "0%";
  progressBar.style.backgroundColor = color;

  const stopStart = Date.now();

  const stopTimer = setInterval(() => {
    if (!paused) {
      const stopElapsed = Math.floor((Date.now() - stopStart) / 1000);
      if (stopElapsed >= stopSeconds) {
        clearInterval(stopTimer);
        display.style.color = "white";
        inStopPhase = false;
        callback();
      }
    }
  }, 200);
}

function startNextStep() {
  if (currentStep >= steps.length) {
    display.textContent = "FIN DU COMBAT";
    progressBar.style.width = "0%";
    display.style.color = "white";

    if (isCustom) {
      showIntermediateStop(() => {}, true);
    }
    return;
  }

  timeLeft = steps[currentStep];
  totalTime = timeLeft;
  elapsed = 0;
  display.textContent = formatTime(timeLeft);
  updateProgress();

  // Envoie la mise à jour du temps toutes les secondes
  sendTimeUpdate();

  timer = setInterval(() => {
    if (!paused) {
      timeLeft--;
      elapsed++;
      display.textContent = formatTime(timeLeft);
      updateProgress();

      sendTimeUpdate();

      if (timeLeft <= 0) {
        clearInterval(timer);
        currentStep++;

        if (currentStep < steps.length) {
          showIntermediateStop(startNextStep);
        } else {
          display.textContent = "FIN";
          progressBar.style.width = "0%";
          display.style.color = "white";

          if (isCustom) {
            showIntermediateStop(() => {}, true);
          }
        }
      }
    }
  }, 1000);
}

function sendTimeUpdate() {
  if (window.opener) {
    window.opener.postMessage({ action: "timeUpdate", timeLeft: timeLeft }, "*");
  }
}

window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.action === "start") {
    steps = event.data.durations;
    isCustom = event.data.isCustom || false;
    currentStep = 0;
    paused = false;
    inStopPhase = false;
    clearInterval(timer);
    startNextStep();
  } else if (event.data.action === "pause") {
    paused = true;
  } else if (event.data.action === "resume") {
    paused = false;
  } else if (event.data.action === "reset") {
    clearInterval(timer);
    currentStep = 0;
    paused = false;
    inStopPhase = false;
    startNextStep();
  }
});
