const CACHE_NAME = 'portfolio-v1';
const STATIC_CACHE = 'portfolio-static-v1';
const DYNAMIC_CACHE = 'portfolio-dynamic-v1';
const API_CACHE = 'portfolio-api-v1';

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/assets/Image/favicon.ico',
    '/assets/Image/user.png',
    '/assets/vd/intro.mp4'
];

// API endpoints to cache (iOS-friendly)
const API_ENDPOINTS = [
    '/api/category',
    '/api/projects',
    '/api/education',
    '/api/experience',
    '/api/skills'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE &&
                        cacheName !== API_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // iOS-specific handling
    if (isIOS) {
        // For iOS, be more conservative with caching
        if (url.pathname.startsWith('/api/')) {
            // API requests - network first, minimal caching for iOS
            event.respondWith(networkFirstIOS(request, API_CACHE));
            return;
        }
    }

    // Handle different types of requests
    if (url.pathname === '/' || url.pathname === '/index.html') {
        // Homepage - cache first, then network
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (url.pathname.startsWith('/api/')) {
        // API requests - network first, then cache
        event.respondWith(networkFirst(request, API_CACHE));
    } else if (url.pathname.startsWith('/assets/')) {
        // Static assets - cache first, then network
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (url.pathname.startsWith('/browser/')) {
        // Built assets - cache first, then network
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else {
        // Other requests - network first, then cache
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Cache first failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network first strategy
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }

        return new Response('Offline', { status: 503 });
    }
}

// iOS-specific network first strategy (more conservative)
async function networkFirstIOS(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // For iOS, only cache successful responses briefly
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());

            // Set a shorter cache time for iOS
            setTimeout(() => {
                cache.delete(request);
            }, 5 * 60 * 1000); // 5 minutes
        }

        return networkResponse;
    } catch (error) {
        console.log('iOS Network failed, trying cache:', error);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // For iOS, return a more graceful offline response
        return new Response(JSON.stringify({
            error: 'Network unavailable',
            message: 'Please check your connection and try again'
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Handle message events (for communication with main thread)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            isIOS: isIOS,
            isSafari: isSafari
        });
    }
});

// Message event - handle communication with main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_RESOURCE':
            cacheResource(data.url, data.response);
            break;

        case 'GET_CACHED_RESOURCE':
            getCachedResource(data.url, event.ports[0]);
            break;

        case 'CLEAR_CACHES':
            clearAllCaches(event.ports[0]);
            break;

        case 'GET_CACHE_STATS':
            getCacheStats(event.ports[0]);
            break;

        default:
            console.log('Unknown message type:', type);
    }
});

// Cache a resource
async function cacheResource(url, responseData) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = new Response(responseData, {
            headers: { 'Content-Type': 'application/json' }
        });

        await cache.put(url, response);
        console.log('Resource cached:', url);
    } catch (error) {
        console.error('Failed to cache resource:', error);
    }
}

// Get cached resource
async function getCachedResource(url, port) {
    try {
        const cachedResponse = await caches.match(url);

        if (cachedResponse) {
            const data = await cachedResponse.text();
            const init = {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: Object.fromEntries(cachedResponse.headers.entries())
            };

            port.postMessage({ cached: true, data, init });
        } else {
            port.postMessage({ cached: false });
        }
    } catch (error) {
        console.error('Failed to get cached resource:', error);
        port.postMessage({ cached: false, error: error.message });
    }
}

// Clear all caches
async function clearAllCaches(port) {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));

        port.postMessage({ success: true, message: 'All caches cleared' });
    } catch (error) {
        console.error('Failed to clear caches:', error);
        port.postMessage({ success: false, error: error.message });
    }
}

// Get cache statistics
async function getCacheStats(port) {
    try {
        const cacheNames = await caches.keys();
        const stats = {};

        for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            stats[name] = {
                size: keys.length,
                keys: keys.map(req => req.url)
            };
        }

        port.postMessage({ success: true, stats });
    } catch (error) {
        console.error('Failed to get cache stats:', error);
        port.postMessage({ success: false, error: error.message });
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Background sync implementation
async function doBackgroundSync() {
    try {
        console.log('Performing background sync...');

        // Sync any pending data
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'BACKGROUND_SYNC_COMPLETE' });
        });

    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body || 'New portfolio update available',
            icon: '/assets/Image/favicon.ico',
            badge: '/assets/Image/favicon.ico',
            data: data.data || {},
            actions: data.actions || [],
            requireInteraction: true
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Portfolio', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});
