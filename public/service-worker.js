const CACHE_NAME = 'edufiliova-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/?page=error-500',
        '/manifest.json'
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses for static assets
            if (networkResponse.ok && (
              event.request.url.endsWith('.js') ||
              event.request.url.endsWith('.css') ||
              event.request.url.endsWith('.woff2') ||
              event.request.url.endsWith('.woff') ||
              event.request.url.endsWith('.ttf') ||
              event.request.url.endsWith('.svg') ||
              event.request.url.endsWith('.png') ||
              event.request.url.endsWith('.jpg') ||
              event.request.url.endsWith('.webp') ||
              event.request.url.endsWith('.ico') ||
              event.request.mode === 'navigate'
            )) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Return cached response if network fails
            if (cachedResponse) {
              return cachedResponse;
            }
            // For navigation requests, return cached error page or index
            if (event.request.mode === 'navigate') {
              return cache.match('/?page=error-500').then(errorPage => {
                return errorPage || cache.match('/');
              });
            }
          });
        
        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
