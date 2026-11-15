const APP_VERSION = 'v1.4.1';

const DEFAULT_SETTINGS = {
  color: '#FF2D20',
  font: 'sans',
  brightness: 100,
  zoom: 100,
  format: '12',
  gifData: '',
  gifName: '',
  gifPos: 'right',
  walkerDensity: 'off',
  walkerHero: 'warrior',
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

const HEROES = {
  warrior: {
    name: 'Warrior',
    walk: 'presets/characters/warrior/walk.gif',
    attack: 'presets/characters/warrior/attack.gif',
    s_attack: 'presets/characters/warrior/s_attack.gif',
    jump: 'presets/characters/warrior/jump.gif',
    idle: 'presets/characters/warrior/idle.gif',
    hurt: 'presets/characters/warrior/hurt.gif',
    baseSpeed: 64
  },
  assasin: {
    name: 'Assassin',
    walk: 'presets/characters/assasin/walk.gif',
    attack: 'presets/characters/assasin/attack.gif',
    s_attack: 'presets/characters/assasin/s_attack.gif',
    jump: 'presets/characters/assasin/jump.gif',
    idle: 'presets/characters/assasin/idle.gif',
    hurt: 'presets/characters/assasin/hurt.gif',
    baseSpeed: 84
  },
  barbarian: {
    name: 'Barbarian',
    walk: 'presets/characters/barbarian/walk.gif',
    attack: 'presets/characters/barbarian/attack.gif',
    s_attack: 'presets/characters/barbarian/s_attack.gif',
    jump: 'presets/characters/barbarian/jump.gif',
    idle: 'presets/characters/barbarian/idle.gif',
    hurt: 'presets/characters/barbarian/hurt.gif',
    baseSpeed: 58
  },
  sorceress: {
    name: 'Sorceress',
    walk: 'presets/characters/sorceress/walk.gif',
    attack: 'presets/characters/sorceress/attack.gif',
    s_attack: 'presets/characters/sorceress/s_attack.gif',
    jump: 'presets/characters/sorceress/jump.gif',
    idle: 'presets/characters/sorceress/idle.gif',
    hurt: 'presets/characters/sorceress/hurt.gif',
    baseSpeed: 70
  },
  necromancer: {
    name: 'Necromancer',
    walk: 'presets/characters/necromancer/walk.gif',
    attack: 'presets/characters/necromancer/attack.gif',
    s_attack: 'presets/characters/necromancer/s_attack.gif',
    jump: 'presets/characters/necromancer/jump.gif',
    idle: 'presets/characters/necromancer/idle.gif',
    hurt: 'presets/characters/necromancer/hurt.gif',
    baseSpeed: 52
  },
  centaur: {
    name: 'Centaur',
    walk: 'presets/characters/centaur/walk.gif',
    attack: 'presets/characters/centaur/attack.gif',
    s_attack: 'presets/characters/centaur/s_attack.gif',
    jump: 'presets/characters/centaur/jump.gif',
    idle: 'presets/characters/centaur/idle.gif',
    hurt: 'presets/characters/centaur/hurt.gif',
    baseSpeed: 94
  },
  cat: {
    name: 'Cat',
    walk: 'presets/cat_walk.gif',
    attack: 'presets/cat_walk.gif',
    s_attack: 'presets/cat_walk.gif',
    jump: 'presets/cat_walk.gif',
    idle: 'presets/cat_walk.gif',
    hurt: 'presets/cat_walk.gif',
    baseSpeed: 72
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
  } catch (e) { }
}

function saveSettings() {
  try {
    localStorage.setItem('nightstand_clock_settings_v1', JSON.stringify(settings));
  } catch (e) { }
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

const borderWalkerLayer = document.getElementById('border-walker-layer');
const walkerStatusLabel = document.getElementById('walker-status-label');
const walkerModeButtons = document.querySelectorAll('#walker-mode-options .segment-btn');
const walkerDensityButtons = document.querySelectorAll('#walker-density-options .segment-btn');
const walkerHeroButtons = document.querySelectorAll('#walker-hero-presets .preset-pill-btn');

const checkUpdateBtn = document.getElementById('check-update-btn');
const checkUpdateText = document.getElementById('check-update-text');
const updateSpinner = document.getElementById('update-spinner');
const updateStatusLabel = document.getElementById('update-status-label');
const updateToast = document.getElementById('update-toast');
const updateToastText = document.getElementById('update-toast-text');

let wakeLock = null;
let hideTimer = null;
let lastHour = '';
let lastMin = '';
let lastAmPm = '';

let activeWalkers = [];
let walkerRafId = null;
let walkerLastTime = 0;

let swRegistration = null;
let isCheckingUpdate = false;
let refreshing = false;

function showUpdateToast(msg, duration = 4000) {
  if (updateToast && updateToastText) {
    updateToastText.textContent = msg;
    updateToast.classList.remove('hidden');
    if (duration > 0) {
      setTimeout(() => {
        updateToast.classList.add('hidden');
      }, duration);
    }
  }
}

async function checkForAppUpdate(isManual = false) {
  if (!('serviceWorker' in navigator) || isCheckingUpdate) {
    return;
  }

  isCheckingUpdate = true;
  if (isManual && updateSpinner && checkUpdateText) {
    updateSpinner.classList.add('spinning');
    checkUpdateText.textContent = 'Checking...';
  }

  try {
    const reg = swRegistration || await navigator.serviceWorker.getRegistration();
    if (!reg) {
      if (isManual && checkUpdateText) {
        checkUpdateText.textContent = 'Up to Date';
        setTimeout(() => {
          checkUpdateText.textContent = 'Check for Updates';
        }, 2500);
      }
      isCheckingUpdate = false;
      if (updateSpinner) updateSpinner.classList.remove('spinning');
      return;
    }

    if (reg.waiting) {
      showUpdateToast('Applying update...', 0);
      reg.waiting.postMessage({ action: 'skipWaiting' });
      return;
    }

    await reg.update();

    if (reg.installing) {
      showUpdateToast('Downloading update...', 0);
      reg.installing.addEventListener('statechange', (e) => {
        if (e.target.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast('Update ready! Refreshing...', 0);
          if (reg.waiting) {
            reg.waiting.postMessage({ action: 'skipWaiting' });
          }
        }
      });
    } else if (reg.waiting) {
      showUpdateToast('Applying update...', 0);
      reg.waiting.postMessage({ action: 'skipWaiting' });
    } else {
      if (isManual) {
        updateStatusLabel.textContent = 'Latest';
        if (checkUpdateText) checkUpdateText.textContent = 'Up to Date!';
        setTimeout(() => {
          updateStatusLabel.textContent = APP_VERSION;
          if (checkUpdateText) checkUpdateText.textContent = 'Check for Updates';
        }, 3000);
      }
    }
  } catch (err) {
    if (isManual) {
      updateStatusLabel.textContent = 'Offline';
      if (checkUpdateText) checkUpdateText.textContent = 'Check Failed';
      setTimeout(() => {
        updateStatusLabel.textContent = APP_VERSION;
        if (checkUpdateText) checkUpdateText.textContent = 'Check for Updates';
      }, 3000);
    }
  } finally {
    if (updateSpinner) {
      updateSpinner.classList.remove('spinning');
    }
    isCheckingUpdate = false;
  }
}

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

function triggerWalkerState(walker, state, duration) {
  walker.state = state;
  walker.stateTimer = duration;
  const data = HEROES[walker.heroKey] || HEROES.warrior;
  if (data && data[state]) {
    walker.imgEl.src = data[state];
  }
}

function createWalkerEntity(heroKey, startOffset, startDirection) {
  const hero = HEROES[heroKey] || HEROES.warrior;
  const domEl = document.createElement('div');
  domEl.className = 'walker-entity';
  const imgEl = document.createElement('img');
  imgEl.className = 'walker-entity-img';
  imgEl.src = hero.walk;
  imgEl.alt = hero.name;
  domEl.appendChild(imgEl);

  const speedVariation = 0.85 + Math.random() * 0.3;
  const actualSpeed = Math.round(hero.baseSpeed * speedVariation);

  const walker = {
    heroKey,
    domEl,
    imgEl,
    dist: startOffset,
    floorX: startOffset,
    direction: startDirection,
    speed: actualSpeed,
    state: 'walk',
    stateTimer: 0,
    cooldown: 2,
    actionTimer: 3 + Math.random() * 8
  };

  domEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const actions = ['s_attack', 'jump', 'attack'];
    const randomAct = actions[Math.floor(Math.random() * actions.length)];
    triggerWalkerState(walker, randomAct, 1.1);
    enableKeepAwake();
  });

  borderWalkerLayer.appendChild(domEl);
  return walker;
}

function updateWalkers(timestamp) {
  if (settings.walkerDensity === 'off' || activeWalkers.length === 0) {
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

  const d1 = Math.max(10, w - 2 * inset - size);
  const d2 = Math.max(10, h - 2 * inset - size);
  const totalDist = 2 * (d1 + d2);

  for (let i = 0; i < activeWalkers.length; i++) {
    const wkr = activeWalkers[i];

    if (wkr.cooldown > 0) {
      wkr.cooldown -= dt;
    }

    if (wkr.stateTimer > 0) {
      wkr.stateTimer -= dt;
      if (wkr.stateTimer <= 0) {
        triggerWalkerState(wkr, 'walk', 0);
      }
    } else {
      wkr.actionTimer -= dt;
      if (wkr.actionTimer <= 0) {
        const roll = Math.random();
        if (roll < 0.28) {
          triggerWalkerState(wkr, 'idle', 1.5 + Math.random() * 2.0);
        } else if (roll < 0.52) {
          triggerWalkerState(wkr, 's_attack', 1.1 + Math.random() * 0.4);
        } else if (roll < 0.72) {
          triggerWalkerState(wkr, 'jump', 0.7);
        } else if (roll < 0.86) {
          triggerWalkerState(wkr, 'attack', 0.8);
        } else {
          wkr.direction = -wkr.direction;
        }
        wkr.actionTimer = 4 + Math.random() * 9;
      }
    }

    if (wkr.state === 'walk') {
      if (settings.walkerMode === 'perimeter') {
        wkr.dist = ((wkr.dist + wkr.direction * wkr.speed * dt) % totalDist + totalDist) % totalDist;
      } else {
        const minX = inset;
        const maxX = Math.max(minX + 10, w - inset - size);
        wkr.floorX += wkr.direction * wkr.speed * dt;
        if (wkr.floorX >= maxX) {
          wkr.floorX = maxX;
          wkr.direction = -1;
        } else if (wkr.floorX <= minX) {
          wkr.floorX = minX;
          wkr.direction = 1;
        }
      }
    }

    if (settings.walkerMode === 'perimeter') {
      let x = inset;
      let y = h - inset - size;
      let rot = 0;
      let flip = wkr.direction;

      if (wkr.dist < d1) {
        x = inset + wkr.dist;
        y = h - inset - size;
        rot = 0;
      } else if (wkr.dist < d1 + d2) {
        const seg = wkr.dist - d1;
        x = w - inset - size;
        y = h - inset - size - seg;
        rot = -90;
      } else if (wkr.dist < 2 * d1 + d2) {
        const seg = wkr.dist - (d1 + d2);
        x = w - inset - size - seg;
        y = inset;
        rot = 180;
      } else {
        const seg = wkr.dist - (2 * d1 + d2);
        x = inset;
        y = inset + seg;
        rot = 90;
      }

      wkr.currentX = x;
      wkr.currentY = y;
      wkr.domEl.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scaleX(${flip})`;
    } else {
      const y = h - inset - size;
      wkr.currentX = wkr.floorX;
      wkr.currentY = y;
      wkr.domEl.style.transform = `translate3d(${wkr.floorX}px, ${y}px, 0) scaleX(${wkr.direction})`;
    }
  }

  if (activeWalkers.length > 1) {
    for (let i = 0; i < activeWalkers.length; i++) {
      for (let j = i + 1; j < activeWalkers.length; j++) {
        const a = activeWalkers[i];
        const b = activeWalkers[j];
        if (a.cooldown <= 0 && b.cooldown <= 0 && a.state === 'walk' && b.state === 'walk') {
          const dx = Math.abs(a.currentX - b.currentX);
          const dy = Math.abs(a.currentY - b.currentY);
          if (dx < 50 && dy < 50) {
            const pick = Math.random();
            if (pick < 0.5) {
              triggerWalkerState(a, 's_attack', 1.0);
              triggerWalkerState(b, 'hurt', 0.9);
            } else {
              triggerWalkerState(a, 'jump', 0.8);
              triggerWalkerState(b, 'attack', 0.8);
            }
            a.cooldown = 4.0;
            b.cooldown = 4.0;
          }
        }
      }
    }
  }

  walkerRafId = requestAnimationFrame(updateWalkers);
}

function startWalkers() {
  if (walkerRafId) {
    cancelAnimationFrame(walkerRafId);
  }
  walkerLastTime = 0;
  walkerRafId = requestAnimationFrame(updateWalkers);
}

function stopWalkers() {
  if (walkerRafId) {
    cancelAnimationFrame(walkerRafId);
    walkerRafId = null;
  }
  borderWalkerLayer.innerHTML = '';
  activeWalkers = [];
}

function applyWalker(persist = true) {
  stopWalkers();

  if (settings.walkerDensity === 'off') {
    walkerStatusLabel.textContent = 'Off';
  } else if (settings.walkerDensity === 'single') {
    const hero = HEROES[settings.walkerHero] || HEROES.warrior;
    activeWalkers = [createWalkerEntity(settings.walkerHero, 12, 1)];
    walkerStatusLabel.textContent = hero.name;
    startWalkers();
  } else if (settings.walkerDensity === 'all') {
    const keys = ['warrior', 'assasin', 'barbarian', 'sorceress', 'necromancer', 'centaur'];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const inset = 12;
    const size = 48;
    const perimeter = 2 * (Math.max(10, w - 2 * inset - size) + Math.max(10, h - 2 * inset - size));
    const step = perimeter / keys.length;

    activeWalkers = keys.map((key, idx) => {
      const initialDir = idx % 2 === 0 ? 1 : -1;
      return createWalkerEntity(key, idx * step, initialDir);
    });
    walkerStatusLabel.textContent = 'All Party (6)';
    startWalkers();
  }

  walkerDensityButtons.forEach(btn => {
    if (btn.dataset.density === settings.walkerDensity) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  walkerModeButtons.forEach(btn => {
    if (btn.dataset.mode === settings.walkerMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  walkerHeroButtons.forEach(btn => {
    if (btn.dataset.hero === settings.walkerHero) {
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
      docEl.requestFullscreen().catch(() => { });
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
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

walkerDensityButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.walkerDensity = btn.dataset.density;
    applyWalker();
    resetHideTimer();
  });
});

walkerModeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.walkerMode = btn.dataset.mode;
    applyWalker();
    resetHideTimer();
  });
});

walkerHeroButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.walkerHero = btn.dataset.hero;
    if (settings.walkerDensity === 'off') {
      settings.walkerDensity = 'single';
    }
    applyWalker();
    resetHideTimer();
  });
});

checkUpdateBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  checkForAppUpdate(true);
  resetHideTimer();
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

  if (settingsDrawer.contains(e.target) || isPinching || e.target.closest('.walker-entity')) {
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
  if (settingsDrawer.contains(e.target) || isPinching || e.target.closest('.walker-entity')) {
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
    checkForAppUpdate(false);
  }
});

if (keepAwakeVideo) {
  keepAwakeVideo.addEventListener('playing', () => setWakeLockUI(true));
  keepAwakeVideo.addEventListener('pause', checkKeepAwakeStatus);
  keepAwakeVideo.addEventListener('ended', () => {
    keepAwakeVideo.play().catch(() => { });
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
      keepAwakeVideo.play().catch(() => { });
    }
  }
  checkKeepAwakeStatus();
}, 15000);

setInterval(() => {
  if (document.visibilityState === 'visible') {
    checkForAppUpdate(false);
  }
}, 1800000);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      swRegistration = reg;
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast('New version ready! Reloading...');
              newWorker.postMessage({ action: 'skipWaiting' });
            }
          });
        }
      });
      checkForAppUpdate(false);
    }).catch(() => { });
  });
}
