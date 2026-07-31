const CACHE_NAME = 'biblia-3d-cache-v1';
const urlsToCache = [
    './index.html',
    './js/core/app.js',
    './js/engine3d/scene.js',
    './js/components/ui.js',
    './data/verses/biblia_completa.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
