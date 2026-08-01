// ============================================================
// sw.js - Service Worker Limpo e Funcional
// ============================================================

const CACHE_VERSION = 'biblia-3d-cache-v20260801-182855';
const STATIC_CACHE = cache-static-\;
const DYNAMIC_CACHE = cache-dynamic-\;

const URLS_TO_CACHE = [
    './index.html',
    './app.js',
    './profile.js',
    './profile.css',
    './css/style.css',
    './manifest.json',
    './img/logo_mpe.jpg'
];

// --- INSTALL ---
self.addEventListener('install', function(event) {
    console.log('[SW] Instalando... Versão:', CACHE_VERSION);
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then(function(cache) {
            console.log('[SW] Cacheando assets...');
            return cache.addAll(URLS_TO_CACHE).catch(function(err) {
                console.warn('[SW] Aviso ao cachear:', err.message);
                // Continua mesmo se alguns assets falharem
                return Promise.resolve();
            });
        })
    );
});

// --- ACTIVATE ---
self.addEventListener('activate', function(event) {
    console.log('[SW] Ativando... Limpando caches antigos');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deletando cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// --- FETCH ---
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);
    
    // Ignora cross-origin
    if (url.origin !== location.origin) {
        return;
    }
    
    // Ignora non-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Para dados JSON: network-first
    if (/\.json$/.test(url.pathname)) {
        event.respondWith(
            fetch(request)
                .then(function(response) {
                    if (response.ok) {
                        var cache = caches.open(DYNAMIC_CACHE);
                        cache.then(function(c) {
                            c.put(request, response.clone());
                        });
                    }
                    return response;
                })
                .catch(function(err) {
                    console.log('[SW] Network falhou, usando cache para:', request.url);
                    return caches.match(request);
                })
        );
        return;
    }
    
    // Fallback: cache ou network
    event.respondWith(
        caches.match(request)
            .then(function(response) {
                return response || fetch(request);
            })
            .catch(function(err) {
                console.error('[SW] Erro:', err.message);
                return new Response('Offline', { status: 503 });
            })
    );
});

console.log('[SW] Service Worker carregado - Versão:', CACHE_VERSION);