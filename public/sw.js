const CACHE_NAME = "flexifit-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.ico"
];

// Cài đặt Service Worker và lưu trữ assets tĩnh
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell and assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Dọn dẹp cache cũ khi kích hoạt phiên bản mới
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Chặn các request và cung cấp nội dung offline-first
self.addEventListener("fetch", (event) => {
  // Chỉ cache các request HTTP/HTTPS thông thường (không cache chrome-extension://, v.v.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Kiểm tra xem response có hợp lệ không trước khi đưa vào cache
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Cache các tài nguyên được tải động (JS, CSS, hình ảnh)
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Fallback khi không có mạng và tài nguyên không có trong cache
        // Ví dụ: có thể trả về index.html cho các định hướng router
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
