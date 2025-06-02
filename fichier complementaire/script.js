let timer = null;
let steps = [];
let currentStep = 0;
let timeLeft = 0;
let totalStepTime = 0;
let elapsedTime = 0;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  const display = document.getElementById('display');
  display.textContent = formatTime(timeLeft);
  if (timeLeft <= 10) {
    display.classList.add('red-blink');
  } else {
    display.classList.remove('red-blink');
  }
}

function updateProgress() {
  const bar = document.getElementById('progressBar');
  const percent = ((totalStepTime - timeLeft) / totalStepTime) * 100;
  bar.style.width = (100 - percent) + '%';

  if (timeLeft <= 10) {
    bar.style.backgroundColor = 'red';
  } else if (timeLeft <= 30) {
    bar.style.backgroundColor = 'orange';
  } else {
    bar.style.backgroundColor = 'green';
  }
}

function startTimer() {
  if (timer) return;
  if (steps.length === 0) {
    const m = parseInt(document.getElementById('minutes').value) || 0;
    const s = parseInt(document.getElementById('seconds').value) || 0;
    steps = [m * 60 + s];
  }

  if (currentStep >= steps.length) return;

  timeLeft = steps[currentStep];
  totalStepTime = timeLeft;
  updateDisplay();
  updateProgress();

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    updateProgress();
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      currentStep++;
      if (currentStep < steps.length) {
        startTimer();
      } else {
        document.getElementById('display').textContent = "STOP";
      }
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  currentStep = 0;
  steps = [];
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('progressBar').style.backgroundColor = 'green';
  document.getElementById('display').classList.remove('red-blink');
  document.getElementById('display').textContent = "00:00";
}

function loadPreset(preset) {
  const presets = {
    escrime: [180],
    behourd: [60, 30, 60],
    profight1: [120, 60, 120, 60, 120],
    profight2: [180, 60, 180, 60, 180]
  };
  resetTimer();
  steps = presets[preset];
  const first = steps[0];
  document.getElementById('minutes').value = Math.floor(first / 60);
  document.getElementById('seconds').value = first % 60;
}