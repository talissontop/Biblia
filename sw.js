const CACHE_NAME = 'biblia-3d-cache-v20260731_195623';
const urlsToCache = [
    './index.html',
    './js/core/app.js',
    './js/engine3d/scene.js',
    './manifest.json'
];

// INSTALAÇÃO: Força o novo cérebro a assumir o controle imediatamente
self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// ATIVAÇÃO: Destruidor de Cache Antigo (A Varredura)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Limpando cache morto:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Exige o controle de todos os celulares logados
    );
});

// BUSCA: Estratégia 'Network First' (Tenta a internet primeiro, se falhar usa o cache)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
