// Patinhas Service Worker - Web Push & Notificações
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Você tem uma nova atualização no Patinhas.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.data?.url || '/',
        notificationId: data.data?.notificationId,
      },
      actions: [
        { action: 'open', title: 'Abrir no Patinhas 🐾' },
        { action: 'close', title: 'Fechar' },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title || 'Patinhas', options));
  } catch (err) {
    console.error('[Service Worker] Erro ao processar push:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
