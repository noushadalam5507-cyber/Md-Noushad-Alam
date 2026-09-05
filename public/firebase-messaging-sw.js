/**
 * Firebase Cloud Messaging Service Worker (FCM)
 * Handles background push notifications for Android, iOS PWA, and Web clients.
 */

self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const notificationTitle = data.notification?.title || data.title || 'NovaGrand Alert';
    const notificationOptions = {
      body: data.notification?.body || data.body || 'You have a new activity update.',
      icon: data.notification?.icon || '/icon.svg',
      badge: '/icon.svg',
      tag: data.tag || 'instagrand-push',
      data: data.data || {},
      vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('NovaGrand', {
        body: text,
        icon: '/icon.svg',
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
