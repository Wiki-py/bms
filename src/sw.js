import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache assets (populated during build)
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache static assets (JS, CSS, images)
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache navigation requests (app shell)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'app-shell',
  })
);

// Cache API calls (e.g., for your inventory form)
registerRoute(
  new RegExp('/api/.*'),
  new CacheFirst({
    cacheName: 'api-cache',
  })
);