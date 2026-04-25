// Rentto Service Worker — versionar con cada deploy si cambian los assets
const CACHE_NAME = "rentto-v2";
const ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // No interceptar cross-origin (Supabase, Resend, Vercel Analytics)
  if (url.origin !== self.location.origin) return;

  // No interceptar APIs ni assets de Next.js (deben siempre ir a la red)
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/")) return;

  // Network-first con fallback a caché para resiliencia offline básica
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Solo cachear respuestas exitosas de assets estáticos
        const esEstatico = /\.(png|jpg|jpeg|svg|ico|woff2|webp)$/i.test(url.pathname);
        if (res.ok && (esEstatico || url.pathname === "/")) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
