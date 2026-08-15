self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sin caché: este service worker solo existe para que el navegador
  // permita instalar la plataforma como app en la pantalla de inicio.
});
