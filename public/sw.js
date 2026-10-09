// DevSecureX Service Worker for PWA functionality
const CACHE_NAME = 'devsecurex-v1.0.0';
const STATIC_CACHE_NAME = 'devsecurex-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'devsecurex-dynamic-v1.0.0';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/dashboard/,
  /^\/api\/analytics/,
  /^\/api\/scans/,
  /^\/api\/repositories/,
  /^\/api\/pull-requests/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event triggered');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache:', STATIC_CACHE_NAME);
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event triggered');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Activate failed:', error);
      })
  );
});

// Fetch event - handle network requests with cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (request.url.includes('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (request.destination === 'image') {
    // Images - Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else if (request.url.includes('.js') || 
             request.url.includes('.css') || 
             request.url.includes('.woff') || 
             request.url.includes('.woff2')) {
    // Static assets - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // HTML pages - Network First with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

// Network First Strategy (good for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a generic offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature is not available offline' 
      }),
      { 
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First Strategy (good for images)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch image:', request.url);
    // Return a placeholder image or empty response
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

// Stale While Revalidate Strategy (good for static assets)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE_NAME);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => null);
  
  return cachedResponse || networkResponsePromise;
}

// Network First with Offline Fallback (good for HTML pages)
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for page, checking cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Handle background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle queued actions when back online
  console.log('[SW] Performing background sync');
  
  try {
    // Sync queued scan requests, notifications, etc.
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BACKGROUND_SYNC_COMPLETE' });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from DevSecureX',
    icon: '/icon-192x192.png',
    badge: '/favicon-32x32.png',
    tag: data.tag || 'general',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'DevSecureX', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded successfully');