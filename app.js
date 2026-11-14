const DEFAULT_SETTINGS = {
  color: '#FF2D20',
  font: 'sans',
  brightness: 100,
  format: '12'
};

const FONT_MAP = {
  sans: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    weight: '400'
  },
  mono: {
    family: "'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace",
    weight: '400'
  },
  thin: {
    family: "'Outfit', 'Helvetica Neue', Arial, sans-serif",
    weight: '200'
  },
  serif: {
    family: "'Playfair Display', Georgia, 'Times New Roman', serif",
    weight: '400'
  }
};

let settings = { ...DEFAULT_SETTINGS };

function loadSettings() {
  try {
    const saved = localStorage.getItem('nightstand_clock_settings_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {}
}

function saveSettings() {
  try {
    localStorage.setItem('nightstand_clock_settings_v1', JSON.stringify(settings));
  } catch (e) {}
}

const clockContainer = document.getElementById('clock-container');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const ampmEl = document.getElementById('ampm');
const settingsDrawer = document.getElementById('settings-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const wakelockDot = document.getElementById('wakelock-dot');
const wakelockText = document.getElementById('wakelock-text');
const colorSwatches = document.querySelectorAll('.color-swatch');
const customColorPicker = document.getElementById('custom-color-picker');
const customColorLabel = document.querySelector('.custom-color-label');
const fontButtons = document.querySelectorAll('#font-options .segment-btn');
const formatButtons = document.querySelectorAll('#format-options .segment-btn');
const brightnessSlider = document.getElementById('brightness-slider');
const brightnessValue = document.getElementById('brightness-value');

let wakeLock = null;
let hideTimer = null;
let lastHour = '';
let lastMin = '';
let lastAmPm = '';

function updateTime() {
  const now = new Date();
  const rawHours = now.getHours();
  const rawMinutes = now.getMinutes();

  let formattedHours;
  let formattedAmPm = '';

  if (settings.format === '12') {
    formattedAmPm = rawHours >= 12 ? 'PM' : 'AM';
    const h12 = rawHours % 12 || 12;
    formattedHours = String(h12);
  } else {
    formattedHours = String(rawHours).padStart(2, '0');
  }

  const formattedMinutes = String(rawMinutes).padStart(2, '0');

  if (formattedHours !== lastHour) {
    hoursEl.textContent = formattedHours;
    lastHour = formattedHours;
  }

  if (formattedMinutes !== lastMin) {
    minutesEl.textContent = formattedMinutes;
    lastMin = formattedMinutes;
  }

  if (settings.format === '12') {
    ampmEl.classList.remove('hidden');
    if (formattedAmPm !== lastAmPm) {
      ampmEl.textContent = formattedAmPm;
      lastAmPm = formattedAmPm;
    }
  } else {
    ampmEl.classList.add('hidden');
  }
}

function shiftClockPosition() {
  const shiftX = (Math.random() * 24 - 12).toFixed(1);
  const shiftY = (Math.random() * 16 - 8).toFixed(1);
  document.documentElement.style.setProperty('--shift-x', `${shiftX}px`);
  document.documentElement.style.setProperty('--shift-y', `${shiftY}px`);
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      setWakeLockUI(true);
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        setWakeLockUI(false);
      });
    } catch (err) {
      setWakeLockUI(false);
    }
  } else {
    setWakeLockUI(false);
  }
}

function setWakeLockUI(active) {
  if (active) {
    wakelockDot.classList.add('active');
    wakelockText.textContent = 'Wake Lock Active';
  } else {
    wakelockDot.classList.remove('active');
    wakelockText.textContent = 'Wake Lock Inactive';
  }
}

function openSettings() {
  settingsDrawer.classList.add('active');
  resetHideTimer();
}

function closeSettings() {
  settingsDrawer.classList.remove('active');
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function isSettingsOpen() {
  return settingsDrawer.classList.contains('active');
}

function resetHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
  hideTimer = setTimeout(() => {
    closeSettings();
  }, 5000);
}

function applyColor(color, persist = true) {
  settings.color = color;
  document.documentElement.style.setProperty('--clock-color', color);

  let matchedPreset = false;
  colorSwatches.forEach(swatch => {
    if (swatch.dataset.color.toLowerCase() === color.toLowerCase()) {
      swatch.classList.add('active');
      matchedPreset = true;
    } else {
      swatch.classList.remove('active');
    }
  });

  if (matchedPreset) {
    customColorLabel.classList.remove('active');
  } else {
    customColorLabel.classList.add('active');
  }

  customColorPicker.value = color;

  if (persist) {
    saveSettings();
  }
}

function applyFont(fontKey, persist = true) {
  const fontData = FONT_MAP[fontKey] || FONT_MAP.sans;
  settings.font = fontKey;
  document.documentElement.style.setProperty('--clock-font', fontData.family);
  document.documentElement.style.setProperty('--clock-weight', fontData.weight);

  fontButtons.forEach(btn => {
    if (btn.dataset.font === fontKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (persist) {
    saveSettings();
  }
}

function applyBrightness(val, persist = true) {
  const num = Math.min(100, Math.max(10, parseInt(val, 10) || 100));
  settings.brightness = num;
  document.documentElement.style.setProperty('--clock-opacity', (num / 100).toFixed(2));
  brightnessSlider.value = num;
  brightnessValue.textContent = `${num}%`;

  if (persist) {
    saveSettings();
  }
}

function applyFormat(format, persist = true) {
  settings.format = format;
  formatButtons.forEach(btn => {
    if (btn.dataset.format === format) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  updateTime();

  if (persist) {
    saveSettings();
  }
}

function initUI() {
  loadSettings();
  applyColor(settings.color, false);
  applyFont(settings.font, false);
  applyBrightness(settings.brightness, false);
  applyFormat(settings.format, false);
  updateTime();
}

colorSwatches.forEach(swatch => {
  swatch.addEventListener('click', (e) => {
    e.stopPropagation();
    applyColor(swatch.dataset.color);
    resetHideTimer();
  });
});

customColorPicker.addEventListener('input', (e) => {
  applyColor(e.target.value);
  resetHideTimer();
});

fontButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyFont(btn.dataset.font);
    resetHideTimer();
  });
});

brightnessSlider.addEventListener('input', (e) => {
  applyBrightness(e.target.value);
  resetHideTimer();
});

formatButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyFormat(btn.dataset.format);
    resetHideTimer();
  });
});

closeDrawerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeSettings();
});

settingsDrawer.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  resetHideTimer();
});

settingsDrawer.addEventListener('input', () => {
  resetHideTimer();
});

let pointerStartY = 0;
let pointerStartX = 0;
let pointerStartBrightness = 100;
let isDraggingVertical = false;

document.addEventListener('pointerdown', (e) => {
  if (settingsDrawer.contains(e.target)) {
    return;
  }

  if (!wakeLock) {
    requestWakeLock();
  }

  pointerStartY = e.clientY;
  pointerStartX = e.clientX;
  pointerStartBrightness = settings.brightness;
  isDraggingVertical = false;
});

document.addEventListener('pointermove', (e) => {
  if (settingsDrawer.contains(e.target) || isSettingsOpen()) {
    return;
  }

  const deltaY = pointerStartY - e.clientY;
  const deltaX = Math.abs(pointerStartX - e.clientX);

  if (!isDraggingVertical && Math.abs(deltaY) > 8 && Math.abs(deltaY) > deltaX) {
    isDraggingVertical = true;
  }

  if (isDraggingVertical) {
    const rangeHeight = window.innerHeight * 0.7;
    const change = (deltaY / rangeHeight) * 90;
    const nextBrightness = Math.round(pointerStartBrightness + change);
    applyBrightness(nextBrightness, false);
  }
});

document.addEventListener('pointerup', (e) => {
  if (settingsDrawer.contains(e.target)) {
    return;
  }

  if (isDraggingVertical) {
    isDraggingVertical = false;
    saveSettings();
    return;
  }

  if (isSettingsOpen()) {
    closeSettings();
  } else {
    openSettings();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock();
    updateTime();
  }
});

initUI();
setInterval(updateTime, 1000);
shiftClockPosition();
setInterval(shiftClockPosition, 60000);
requestWakeLock();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

