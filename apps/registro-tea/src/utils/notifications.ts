// Gestión de notificaciones web (permiso del navegador + service worker) para las
// alertas de vencimiento del Registro TEA. Ver public/sw.js para el manejo de los
// eventos 'push' y 'notificationclick'.

const NOTIFIED_KEY = 'tea_notified_alert_ids';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (err) {
    console.error('No se pudo registrar el service worker de notificaciones:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  await registerServiceWorker();
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.error('No se pudo solicitar permiso de notificaciones:', err);
    return Notification.permission;
  }
}

export async function showLocalNotification(
  title: string,
  options: { body: string; url?: string; tag?: string; critical?: boolean; recordId?: string },
): Promise<void> {
  if (getNotificationPermission() !== 'granted') return;
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body: options.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: options.tag ?? 'tea-alert',
      data: { url: options.url ?? '/', recordId: options.recordId },
      requireInteraction: options.critical === true,
    });
  } catch (err) {
    console.error('No se pudo mostrar la notificación local:', err);
  }
}

function loadNotifiedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // almacenamiento no disponible; se omite la deduplicación entre sesiones
  }
}

/** Evita notificar repetidamente la misma alerta en sesiones sucesivas. */
export function hasBeenNotified(alertId: string): boolean {
  return loadNotifiedIds().has(alertId);
}

export function markNotified(alertIds: string[]): void {
  const ids = loadNotifiedIds();
  alertIds.forEach((id) => ids.add(id));
  saveNotifiedIds(ids);
}
