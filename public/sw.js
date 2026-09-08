// Service Worker — Registro TEA · Ley 163-2024
// Procesa notificaciones (push del servidor y notificaciones locales disparadas por la
// propia app) en segundo plano, incluso cuando la pestaña no tiene el foco.
//
// Nota: el evento 'push' solo se dispara cuando existe una suscripción real a un
// servicio de Web Push respaldado por un servidor (VAPID). Esta aplicación no incluye
// ese backend todavía (requeriría credenciales/infraestructura adicionales), pero el
// manejador queda listo para cuando se conecte uno. Mientras tanto, las alertas de
// vencimiento se muestran mediante notificaciones locales mientras la app está abierta,
// usando self.registration.showNotification(), que este mismo service worker atiende.

const APP_URL_FALLBACK = '/';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: 'Registro TEA · Ley 163-2024', body: event.data.text() };
    }
  }

  const title = payload.title || 'Registro TEA · Ley 163-2024';
  const options = {
    body: payload.body || 'Hay expedientes con plazos o seguimientos vencidos.',
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/icon.svg',
    tag: payload.tag || 'tea-alert',
    data: { url: payload.url || APP_URL_FALLBACK, recordId: payload.recordId },
    requireInteraction: payload.critical === true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || APP_URL_FALLBACK;
  const recordId = notificationData.recordId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const postOpenRecord = (client) => {
        if (recordId) client.postMessage({ type: 'tea-open-record', recordId });
      };
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && client.url !== targetUrl) {
            client.navigate(targetUrl);
          }
          postOpenRecord(client);
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});

self.addEventListener('notificationclose', () => {
  // No se requiere acción; reservado para telemetría futura si se añade un backend.
});
