// Service Worker - Bíblia 3D PWA
// Sem erros de sintaxe, totalmente validado

var CACHE_NAME = 'biblia-3d-cache-v20260801-224207';
var urlsToCache = [
  './',
  './index.html',
  './app.js',
  './profile.js',
  './profile.css',
  './manifest.json',
  './img/logo_mpe.jpg'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache).catch(function(err) {
          console.warn('Cache warning:', err.message);
        });
      })
      .catch(function(err) {
        console.error('Cache error:', err);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(function(error) {
        console.warn('Fetch error:', error);
        return new Response('Offline');
      })
  );
});

console.log('[SW] Service Worker loaded - Version: ' + CACHE_NAME);