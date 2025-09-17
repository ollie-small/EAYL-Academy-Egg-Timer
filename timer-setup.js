// timer-setup.js

document.addEventListener('DOMContentLoaded', function () {
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const form = document.getElementById('timer-setup-form');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Add a display for the countdown (if not present)
  let display = document.getElementById('timer-display');
  if (!display) {
    display = document.createElement('div');
    display.id = 'timer-display';
    display.className = 'text-4xl font-mono text-center my-4';
    form.parentNode.insertBefore(display, form.nextSibling);
  }

  let timer = null;
  let remaining = 0;
  let paused = false;

  function updateDisplay() {
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function validateInput() {
    let min = parseInt(minutesInput.value, 10);
    let sec = parseInt(secondsInput.value, 10);
    if (isNaN(min) || min < 0) min = 0;
    if (isNaN(sec) || sec < 0) sec = 0;
    if (min > 59) min = 59;
    if (sec > 59) sec = 59;
    // Prevent both fields being zero
    if (min === 0 && sec === 0) {
      secondsInput.setCustomValidity('Timer must be at least 1 second.');
    } else {
      secondsInput.setCustomValidity('');
    }
    minutesInput.value = min;
    secondsInput.value = sec;
  }

  function setInputsDisabled(disabled) {
    minutesInput.disabled = disabled;
    secondsInput.disabled = disabled;
    presetButtons.forEach(btn => btn.disabled = disabled);
  }

  function startTimer() {
    validateInput();
    if (timer) clearInterval(timer);
    if (!paused) {
      // Only set remaining if not resuming
      remaining = parseInt(minutesInput.value, 10) * 60 + parseInt(secondsInput.value, 10);
    }
    if (remaining <= 0) return;
    setInputsDisabled(true);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    updateDisplay();
    timer = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        updateDisplay();
      } else {
        clearInterval(timer);
        timer = null;
        display.textContent = 'Time\'s up!';
        // Play beep sound when timer finishes
        beep(3);
        setInputsDisabled(false);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resetBtn.disabled = true;
      }
  // Simple beep function using Web Audio API
  function beep(times = 1) {
    let count = 0;
    function singleBeep() {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 1200;
      gain.gain.value = 0.2;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
        count++;
        if (count < times) {
          setTimeout(singleBeep, 200);
        }
      }, 150);
    }
    singleBeep();
  }
    }, 1000);
  }

  function pauseTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      paused = true;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
    }
  }

  function resetTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    paused = false;
    setInputsDisabled(false);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    display.textContent = '';
  }

  startBtn.addEventListener('click', function () {
    if (paused) {
      paused = false;
      setInputsDisabled(true);
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resetBtn.disabled = false;
      timer = setInterval(() => {
        if (remaining > 0) {
          remaining--;
          updateDisplay();
        } else {
          clearInterval(timer);
          timer = null;
          display.textContent = "Time's up!";
          setInputsDisabled(false);
          startBtn.disabled = false;
          pauseBtn.disabled = true;
          resetBtn.disabled = true;
        }
      }, 1000);
    } else {
      paused = false;
      startTimer();
    }
  });
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  // Preset button logic
  presetButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const min = parseInt(btn.getAttribute('data-minutes'), 10) || 0;
      const sec = parseInt(btn.getAttribute('data-seconds'), 10) || 0;
      minutesInput.value = min;
      secondsInput.value = sec;
      validateInput();
      resetTimer();
    });
  });

  minutesInput.addEventListener('input', validateInput);
  secondsInput.addEventListener('input', validateInput);

  form.addEventListener('submit', function (e) {
    validateInput();
    if (!form.checkValidity()) {
      e.preventDefault();
    }
  });
});
