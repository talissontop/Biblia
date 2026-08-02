// Service Worker - Bíblia 3D PWA
var CACHE_NAME = 'biblia-3d-cache-v20260802-110150';
var URLS_TO_CACHE = [
    './estudos/angelologia.html',
    './estudos/escatologia.html',
    './estudos/soteriologia.html',
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
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.allSettled(
                URLS_TO_CACHE.map(function(url) { return cache.add(url); })
            );
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            );
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request).then(function(response) {
                if (!response || response.status !== 200 || response.type === 'error') return response;
                var responseToCache = response.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, responseToCache); });
                return response;
            });
        }).catch(function() { return new Response('Offline'); })
    );
});