// Basit Service Worker
self.addEventListener('fetch', (event) => {
    // Sadece fetch eventini dinler, ağ isteğini doğrudan geri döndürür.
    event.respondWith(fetch(event.request));
});
