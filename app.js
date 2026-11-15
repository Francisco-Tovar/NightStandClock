const DEFAULT_SETTINGS = {
  color: '#FF2D20',
  font: 'sans',
  brightness: 100,
  zoom: 100,
  format: '12',
  gifData: '',
  gifName: '',
  gifPos: 'right',
  walkerEnabled: false,
  walkerSprite: 'presets/goblin_walk.gif',
  walkerName: 'goblin',
  walkerMode: 'perimeter'
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
  },
  segment: {
    family: "'DSEG7 Classic', monospace",
    weight: '400'
  }
};

const COMPANION_PRESETS = {
  flame: 'presets/flame.gif',
  heart: 'presets/heart.gif',
  star: 'presets/star.gif'
};

const WALKER_PRESETS = {
  goblin: 'presets/goblin_walk.gif',
  cat: 'presets/cat_walk.gif'
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
const companionWrapper = document.getElementById('companion-wrapper');
const companionImg = document.getElementById('companion-img');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const ampmEl = document.getElementById('ampm');
const settingsDrawer = document.getElementById('settings-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenExpandIcon = document.getElementById('fullscreen-expand-icon');
const fullscreenCompressIcon = document.getElementById('fullscreen-compress-icon');
const wakelockDot = document.getElementById('wakelock-dot');
const wakelockText = document.getElementById('wakelock-text');
const colorSwatches = document.querySelectorAll('.color-swatch');
const customColorPicker = document.getElementById('custom-color-picker');
const customColorLabel = document.querySelector('.custom-color-label');
const fontButtons = document.querySelectorAll('#font-options .segment-btn');
const formatButtons = document.querySelectorAll('#format-options .segment-btn');
const brightnessSlider = document.getElementById('brightness-slider');
const brightnessValue = document.getElementById('brightness-value');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.getElementById('zoom-value');
const keepAwakeVideo = document.getElementById('keep-awake-video');
const gifStatusLabel = document.getElementById('gif-status-label');
const companionPosButtons = document.querySelectorAll('#companion-pos-options .segment-btn');
const gifUploadInput = document.getElementById('gif-upload-input');
const removeGifBtn = document.getElementById('remove-gif-btn');
const presetPillButtons = document.querySelectorAll('#companion-presets .preset-pill-btn');

const borderWalkerEl = document.getElementById('border-walker');
const borderWalkerImg = document.getElementById('border-walker-img');
const walkerStatusLabel = document.getElementById('walker-status-label');
const walkerModeButtons = document.querySelectorAll('#walker-mode-options .segment-btn');
const walkerUploadInput = document.getElementById('walker-upload-input');
const walkerToggleBtn = document.getElementById('walker-toggle-btn');
const walkerToggleText = document.getElementById('walker-toggle-text');
const walkerPresetButtons = document.querySelectorAll('#walker-presets .preset-pill-btn');

let wakeLock = null;
let hideTimer = null;
let lastHour = '';
let lastMin = '';
let lastAmPm = '';

let walkerRafId = null;
let walkerLastTime = 0;
let walkerDist = 0;
let walkerFloorX = 12;
let walkerFloorDirection = 1;

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

function isKeepAwakeActive() {
  const isVideoPlaying = keepAwakeVideo && !keepAwakeVideo.paused && !keepAwakeVideo.ended && keepAwakeVideo.readyState > 1;
  return Boolean(wakeLock || isVideoPlaying);
}

function checkKeepAwakeStatus() {
  setWakeLockUI(isKeepAwakeActive());
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      setWakeLockUI(true);
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        checkKeepAwakeStatus();
      });
    } catch (err) {
      checkKeepAwakeStatus();
    }
  } else {
    checkKeepAwakeStatus();
  }
}

function startVideoKeepAwake() {
  if (keepAwakeVideo) {
    keepAwakeVideo.play().then(() => {
      setWakeLockUI(true);
    }).catch(() => {
      checkKeepAwakeStatus();
    });
  }
}

function enableKeepAwake() {
  requestWakeLock();
  startVideoKeepAwake();
}

function setWakeLockUI(active) {
  if (active) {
    wakelockDot.classList.add('active');
    wakelockText.textContent = 'Keep-Awake Active';
  } else {
    wakelockDot.classList.remove('active');
    wakelockText.textContent = 'Keep-Awake Inactive';
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

function applyZoom(val, persist = true) {
  const num = Math.min(150, Math.max(60, parseInt(val, 10) || 100));
  settings.zoom = num;
  document.documentElement.style.setProperty('--clock-zoom', (num / 100).toFixed(2));
  zoomSlider.value = num;
  zoomValue.textContent = `${num}%`;

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

function applyGif(persist = true) {
  if (settings.gifData) {
    companionImg.src = settings.gifData;
    companionWrapper.classList.remove('hidden');
    gifStatusLabel.textContent = settings.gifName || 'Active';
  } else {
    companionImg.removeAttribute('src');
    companionWrapper.classList.add('hidden');
    gifStatusLabel.textContent = 'None';
  }

  if (settings.gifPos === 'left') {
    companionWrapper.classList.add('pos-left');
    companionWrapper.classList.remove('pos-right');
  } else {
    companionWrapper.classList.add('pos-right');
    companionWrapper.classList.remove('pos-left');
  }

  companionPosButtons.forEach(btn => {
    if (btn.dataset.pos === settings.gifPos) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  presetPillButtons.forEach(btn => {
    if (settings.gifData && settings.gifName === btn.dataset.preset) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (persist) {
    saveSettings();
  }
}

function updateWalkerAnimation(timestamp) {
  if (!settings.walkerEnabled) {
    return;
  }

  if (!walkerLastTime) {
    walkerLastTime = timestamp;
  }
  const dt = Math.min((timestamp - walkerLastTime) / 1000, 0.1);
  walkerLastTime = timestamp;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const inset = 12;
  const size = 48;
  const speed = 70;

  if (settings.walkerMode === 'perimeter') {
    const d1 = Math.max(10, w - 2 * inset - size);
    const d2 = Math.max(10, h - 2 * inset - size);
    const totalDist = 2 * (d1 + d2);

    walkerDist = (walkerDist + speed * dt) % totalDist;

    let x = inset;
    let y = h - inset - size;
    let rot = 0;
    let flip = 1;

    if (walkerDist < d1) {
      x = inset + walkerDist;
      y = h - inset - size;
      rot = 0;
      flip = 1;
    } else if (walkerDist < d1 + d2) {
      const seg = walkerDist - d1;
      x = w - inset - size;
      y = h - inset - size - seg;
      rot = -90;
      flip = 1;
    } else if (walkerDist < 2 * d1 + d2) {
      const seg = walkerDist - (d1 + d2);
      x = w - inset - size - seg;
      y = inset;
      rot = 180;
      flip = 1;
    } else {
      const seg = walkerDist - (2 * d1 + d2);
      x = inset;
      y = inset + seg;
      rot = 90;
      flip = 1;
    }

    borderWalkerEl.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scaleX(${flip})`;
  } else {
    const minX = inset;
    const maxX = Math.max(minX + 10, w - inset - size);
    walkerFloorX += walkerFloorDirection * speed * dt;
    if (walkerFloorX >= maxX) {
      walkerFloorX = maxX;
      walkerFloorDirection = -1;
    } else if (walkerFloorX <= minX) {
      walkerFloorX = minX;
      walkerFloorDirection = 1;
    }
    const y = h - inset - size;
    borderWalkerEl.style.transform = `translate3d(${walkerFloorX}px, ${y}px, 0) scaleX(${walkerFloorDirection})`;
  }

  walkerRafId = requestAnimationFrame(updateWalkerAnimation);
}

function startWalker() {
  if (walkerRafId) {
    cancelAnimationFrame(walkerRafId);
  }
  walkerLastTime = 0;
  borderWalkerEl.classList.remove('hidden');
  walkerRafId = requestAnimationFrame(updateWalkerAnimation);
}

function stopWalker() {
  if (walkerRafId) {
    cancelAnimationFrame(walkerRafId);
    walkerRafId = null;
  }
  borderWalkerEl.classList.add('hidden');
}

function applyWalker(persist = true) {
  if (settings.walkerEnabled && settings.walkerSprite) {
    borderWalkerImg.src = settings.walkerSprite;
    startWalker();
    walkerStatusLabel.textContent = settings.walkerName || 'Active';
    walkerToggleText.textContent = 'Disable';
  } else {
    stopWalker();
    walkerStatusLabel.textContent = 'Off';
    walkerToggleText.textContent = 'Enable';
  }

  walkerModeButtons.forEach(btn => {
    if (btn.dataset.mode === settings.walkerMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  walkerPresetButtons.forEach(btn => {
    const wKey = btn.dataset.walker;
    if (wKey === 'off' && !settings.walkerEnabled) {
      btn.classList.add('active');
    } else if (settings.walkerEnabled && settings.walkerName === wKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (persist) {
    saveSettings();
  }
}

function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function toggleFullscreen() {
  if (!isFullscreen()) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function updateFullscreenUI() {
  const active = isFullscreen();
  if (active) {
    fullscreenBtn.classList.add('active');
    fullscreenExpandIcon.classList.add('hidden');
    fullscreenCompressIcon.classList.remove('hidden');
  } else {
    fullscreenBtn.classList.remove('active');
    fullscreenExpandIcon.classList.remove('hidden');
    fullscreenCompressIcon.classList.add('hidden');
  }
}

function initUI() {
  loadSettings();
  applyColor(settings.color, false);
  applyFont(settings.font, false);
  applyBrightness(settings.brightness, false);
  applyZoom(settings.zoom, false);
  applyFormat(settings.format, false);
  applyGif(false);
  applyWalker(false);
  updateFullscreenUI();
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

zoomSlider.addEventListener('input', (e) => {
  applyZoom(e.target.value);
  resetHideTimer();
});

formatButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyFormat(btn.dataset.format);
    resetHideTimer();
  });
});

companionPosButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.gifPos = btn.dataset.pos;
    applyGif();
    resetHideTimer();
  });
});

gifUploadInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      settings.gifData = event.target.result;
      settings.gifName = file.name;
      applyGif();
      resetHideTimer();
    };
    reader.readAsDataURL(file);
  }
  gifUploadInput.value = '';
});

removeGifBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  settings.gifData = '';
  settings.gifName = '';
  applyGif();
  resetHideTimer();
});

presetPillButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const presetKey = btn.dataset.preset;
    if (settings.gifData && settings.gifName === presetKey) {
      settings.gifData = '';
      settings.gifName = '';
    } else if (COMPANION_PRESETS[presetKey]) {
      settings.gifData = COMPANION_PRESETS[presetKey];
      settings.gifName = presetKey;
    }
    applyGif();
    resetHideTimer();
  });
});

walkerToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  settings.walkerEnabled = !settings.walkerEnabled;
  applyWalker();
  resetHideTimer();
});

walkerModeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.walkerMode = btn.dataset.mode;
    applyWalker();
    resetHideTimer();
  });
});

walkerUploadInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      settings.walkerSprite = event.target.result;
      settings.walkerName = file.name;
      settings.walkerEnabled = true;
      applyWalker();
      resetHideTimer();
    };
    reader.readAsDataURL(file);
  }
  walkerUploadInput.value = '';
});

walkerPresetButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wKey = btn.dataset.walker;
    if (wKey === 'off') {
      settings.walkerEnabled = false;
    } else if (WALKER_PRESETS[wKey]) {
      settings.walkerSprite = WALKER_PRESETS[wKey];
      settings.walkerName = wKey;
      settings.walkerEnabled = true;
    }
    applyWalker();
    resetHideTimer();
  });
});

fullscreenBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFullscreen();
  resetHideTimer();
});

closeDrawerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeSettings();
});

settingsDrawer.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  enableKeepAwake();
  resetHideTimer();
});

settingsDrawer.addEventListener('input', () => {
  resetHideTimer();
});

let pointerStartY = 0;
let pointerStartX = 0;
let pointerStartBrightness = 100;
let isDraggingVertical = false;
let isPinching = false;
let pinchStartDist = 0;
let pinchStartZoom = 100;

document.addEventListener('touchstart', (e) => {
  enableKeepAwake();
  if (e.touches.length === 2 && !settingsDrawer.contains(e.target)) {
    isPinching = true;
    isDraggingVertical = false;
    pinchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    pinchStartZoom = settings.zoom;
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (isPinching && e.touches.length === 2) {
    const currentDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    if (pinchStartDist > 0) {
      const factor = currentDist / pinchStartDist;
      const targetZoom = Math.round(pinchStartZoom * factor);
      applyZoom(targetZoom, false);
    }
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (isPinching && e.touches.length < 2) {
    isPinching = false;
    saveSettings();
  }
}, { passive: true });

document.addEventListener('pointerdown', (e) => {
  enableKeepAwake();

  if (settingsDrawer.contains(e.target) || isPinching) {
    return;
  }

  pointerStartY = e.clientY;
  pointerStartX = e.clientX;
  pointerStartBrightness = settings.brightness;
  isDraggingVertical = false;
});

document.addEventListener('pointermove', (e) => {
  if (settingsDrawer.contains(e.target) || isSettingsOpen() || isPinching) {
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
  if (settingsDrawer.contains(e.target) || isPinching) {
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

document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    enableKeepAwake();
    updateTime();
  }
});

if (keepAwakeVideo) {
  keepAwakeVideo.addEventListener('playing', () => setWakeLockUI(true));
  keepAwakeVideo.addEventListener('pause', checkKeepAwakeStatus);
  keepAwakeVideo.addEventListener('ended', () => {
    keepAwakeVideo.play().catch(() => {});
  });
}

initUI();
setInterval(updateTime, 1000);
shiftClockPosition();
setInterval(shiftClockPosition, 60000);
enableKeepAwake();
setInterval(() => {
  if (document.visibilityState === 'visible') {
    if (!wakeLock && 'wakeLock' in navigator) {
      requestWakeLock();
    }
    if (keepAwakeVideo && keepAwakeVideo.paused) {
      keepAwakeVideo.play().catch(() => {});
    }
  }
  checkKeepAwakeStatus();
}, 15000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
