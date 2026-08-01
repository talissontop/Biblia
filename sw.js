// ============================================================
// sw.js - Service Worker com Cache Otimizado para MPE
// ============================================================

const CACHE_VERSION = 'biblia-3d-cache-v20260801-180851';
const STATIC_CACHE = cache-static-\;
const DYNAMIC_CACHE = cache-dynamic-\;
const IMAGE_CACHE = cache-images-\;

const URLS_TO_CACHE = [
    './index.html',
    './profile.css',
    './profile.js',
    './css/style.css',
    './js/core/app.js',
    './manifest.json',
    './img/logo_mpe.jpg',
    './data/verses/biblia_completa.json'
];

// --- INSTALL: Cache agressivo ---
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(URLS_TO_CACHE)
                .catch(err => console.error('[SW] Erro ao cachear assets:', err));
        })
    );
});

// --- ACTIVATE: Limpeza de caches antigos ---
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
                    .map(name => {
                        console.log('[SW] Deletando cache obsoleto:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// --- FETCH: Estratégia de cache inteligente ---
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora cross-origin
    if (url.origin !== location.origin) return;

    // Ignora non-GET
    if (request.method !== 'GET') return;

    // Network-first para dados
    if (/\.(json|html|manifest)$/.test(url.pathname)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const cache = caches.open(DYNAMIC_CACHE);
                        cache.then(c => c.put(request, response.clone()));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first para imagens
    if (/\.(jpg|jpeg|png|gif|svg|webp)$/.test(url.pathname)) {
        event.respondWith(
            caches.match(request)
                .then(cached => cached || fetch(request)
                    .then(response => {
                        if (response.ok) {
                            caches.open(IMAGE_CACHE).then(c => c.put(request, response.clone()));
                        }
                        return response;
                    })
                )
        );
        return;
    }

    // Fallback: cache ou network
    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
            .catch(() => new Response('Offline', { status: 503 }))
    );
});

// --- Comunicação com cliente ---
self.addEventListener('message', (event) => {
    if (event.data.type === 'CHECK_UPDATE') {
        event.ports[0].postMessage({
            type: 'CURRENT_VERSION',
            version: CACHE_VERSION
        });
    }
});

console.log('[SW] Service Worker carregado - Versão:', CACHE_VERSION);