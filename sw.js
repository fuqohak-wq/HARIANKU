const CACHE_NAME = 'fuqohak-tracker-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=500;600;700;800&display=swap'
];

// Pasang Service Worker dan simpan aset utama ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Menyimpan aset penting ke dalam cache lokal...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Bersihkan cache lama jika ada versi baru
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lawas:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi cache: Ambil dari cache dulu untuk mempercepat rendering, jika tidak ada baru ambil dari internet
self.addEventListener('fetch', event => {
  // Lewati penyimpanan cache untuk transaksi API dinamis (Google Apps Script)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // Simpan aset eksternal baru yang valid ke dalam cache secara dinamis
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const cacheToKeep = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, cacheToKeep);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Skenario darurat jika benar-benar offline tanpa koneksi sama sekali
      return caches.match('./index.html');
    })
  );
});
