/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'offline-schedules-cache-v1';
const SCHEDULE_API_URL = '/schedules'; // adjust if your API prefix differs

// Install event
// eslint-disable-next-line no-unused-vars
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installed');
    self.skipWaiting(); // activate immediately
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activated');
    event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests to /schedules (API)
    if (request.method === 'GET' && request.url.includes(SCHEDULE_API_URL)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                try {
                    const response = await fetch(request);
                    cache.put(request, response.clone());
                    return response;
                } catch (err) {
                    // Fallback to cache
                    console.log(err);

                    const cachedResponse = await cache.match(request);
                    if (cachedResponse) return cachedResponse;
                    return new Response(JSON.stringify({ success: false, message: 'Offline and no cache' }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            })
        );
    }
});

// Background Sync for pending forms
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-pending-forms') {
        event.waitUntil(syncPendingForms());
    }
});

// Function to notify clients to resend pending forms
async function syncPendingForms() {
    console.log('[ServiceWorker] Syncing pending forms...');
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
        client.postMessage({ type: 'SYNC_PENDING_FORMS' });
    });
}
