
const CACHE_NAME = 'sp-map-fr-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './constants/index.ts',
  './constants/icons.tsx',
  './services/geoUtils.ts',
  './types.ts'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Cache-first pour les assets, Network-first pour le reste
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Stratégie Cache First pour les fichiers statiques (JS, CSS, Images, Polices)
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    ASSETS_TO_CACHE.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  } else {
    // Stratégie Network First pour le contenu dynamique (le reste)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
