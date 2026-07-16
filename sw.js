const CACHE_NAME = "fuqohak-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./membaca.html",
  "https://cdn.tailwindcss.com"
];

// Tahap Install: Simpan aset statis dasar ke dalam cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Tahap Aktifkan: Bersihkan cache versi usang
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intersepsi Request: Ambil dari cache jika offline (kecuali untuk request data real-time)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("script.google.com")) {
    return; // Biarkan request POST dan fetch database spreadsheet berjalan langsung ke server
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Fallback aman jika koneksi offline total
      });
    })
  );
});
