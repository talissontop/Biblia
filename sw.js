const CACHE_NAME = 'biblia-3d-cache-v2026-08-01_132934';
const urlsToCache = [
    './index.html',
    './js/core/app.js',
    './js/engine3d/scene.js',
    './manifest.json',
    './data/verses/biblia_completa.json',
];

self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
