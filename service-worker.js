// Simple service worker that doesn't cache anything to avoid errors
const CACHE_NAME = "memelab-v1";

self.addEventListener("install", (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Only handle requests from our origin
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For all other requests, just let them pass through
  // No caching to avoid any potential errors
  event.respondWith(fetch(event.request));
});
