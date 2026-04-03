self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only proxy requests that are not to the same origin (to avoid proxying the app itself)
  if (url.origin !== self.location.origin) {
    const proxyUrl = `${self.location.origin}/proxy?url=${encodeURIComponent(event.request.url)}`;
    event.respondWith(fetch(proxyUrl));
  }
});