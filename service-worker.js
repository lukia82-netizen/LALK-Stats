/* ============================================
   Basketball Scoreboard - Service Worker
   PWA Offline Support
   ============================================ */

const CACHE_NAME = 'lalk-stats-v3.0.0';
const urlsToCache = [
  '/index-refactored.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/TimesSquare.ttf',
  // Vue.js CDN will be cached on first load
  'https://unpkg.com/vue@3/dist/vue.global.prod.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Network request
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the new response for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          // Could return a custom offline page here
          throw error;
        });
      })
  );
});

// Background sync for cloud sync feature (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-data') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  try {
    // This will be implemented with cloud sync feature
    console.log('[Service Worker] Syncing game data...');
    // TODO: Implement actual sync logic with backend
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error;
  }
}

// Push notifications for live updates (optional)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'New game update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LALK Stats', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/index-refactored.html')
  );
});
