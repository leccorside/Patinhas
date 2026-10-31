// Patinhas Service Worker - PWA, Offline Cache & Web Push
const CACHE_NAME = 'patinhas-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// 1. Instalação: Cache dos recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Ativação: Limpeza de caches obsoletos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptação de Requisições (Fetch): Network First com Cache Fallback
self.addEventListener('fetch', (event) => {
  // Ignora requisições de API e Websocket para permitir sempre dados atualizados
  if (
    event.request.url.includes('/api/v1/') ||
    event.request.url.includes('/socket.io/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Se for navegação de página html e estiver offline, retorna index do cache
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Sem conexão com a internet', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' }),
          });
        });
      })
  );
});

// 4. Notificações Web Push
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Você tem uma nova atualização no Patinhas.',
      icon: data.icon || '/icons/icon-192x192.svg',
      badge: data.badge || '/icons/icon-192x192.svg',
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

// 5. Clique em Notificação
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
