// 4TP Clinic ERP - Service Worker
const CACHE_NAME = '4tp-clinic-v2';
const STATIC_ASSETS = [
    '/',
    '/app',
    '/clinic.svg',
    '/manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cachedApp = await caches.match('/app');
                const cachedRoot = await caches.match('/');
                return cachedApp || cachedRoot || Response.error();
            })
        );
        return;
    }

    // Network-first for API calls
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cached = await caches.match(event.request);
                return cached || new Response(JSON.stringify({ error: 'Network request failed.' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                });
            })
        );
        return;
    }
    // Cache-first for static assets, network fallback
    event.respondWith(
        caches.match(event.request).then((cached) =>
            cached || fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => Response.error())
        )
    );
});
