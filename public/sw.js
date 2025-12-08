// Service Worker for MaliyaPay PWA
const CACHE_NAME = 'maliyapay-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/build/assets/app.css',
    '/build/assets/app.js',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()),
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    }),
                );
            })
            .then(() => self.clients.claim()),
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // API requests - network first, cache fallback
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone response to cache it
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                }),
        );
        return;
    }

    // Static assets - cache first, network fallback
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type !== 'basic'
                ) {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        }),
    );
});

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncTransactions());
    }
});

async function syncTransactions() {
    // Get pending transactions from IndexedDB
    // Send to server when online
    console.log('Syncing transactions...');
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nouvelle notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
    };

    event.waitUntil(self.registration.showNotification('MaliyaPay', options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
