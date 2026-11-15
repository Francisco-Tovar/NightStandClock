const CACHE_NAME = 'nightstand-clock-v7';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './fonts/DSEG7Classic-Regular.woff2',
  './nosleep.mp4',
  './presets/flame.gif',
  './presets/heart.gif',
  './presets/star.gif',
  './presets/cat_walk.gif',
  './presets/characters/warrior/walk.gif',
  './presets/characters/warrior/attack.gif',
  './presets/characters/warrior/idle.gif',
  './presets/characters/warrior/hurt.gif',
  './presets/characters/assasin/walk.gif',
  './presets/characters/assasin/attack.gif',
  './presets/characters/assasin/idle.gif',
  './presets/characters/assasin/hurt.gif',
  './presets/characters/barbarian/walk.gif',
  './presets/characters/barbarian/attack.gif',
  './presets/characters/barbarian/idle.gif',
  './presets/characters/barbarian/hurt.gif',
  './presets/characters/sorceress/walk.gif',
  './presets/characters/sorceress/attack.gif',
  './presets/characters/sorceress/idle.gif',
  './presets/characters/sorceress/hurt.gif',
  './presets/characters/necromancer/walk.gif',
  './presets/characters/necromancer/attack.gif',
  './presets/characters/necromancer/idle.gif',
  './presets/characters/necromancer/hurt.gif',
  './presets/characters/centaur/walk.gif',
  './presets/characters/centaur/attack.gif',
  './presets/characters/centaur/idle.gif',
  './presets/characters/centaur/hurt.gif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
