// Service Worker pour les notifications push
self.addEventListener('install', (event) => {
  // console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // console.log('[Service Worker] Activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  // console.log('[Service Worker] Push received:', event);

  if (!event.data) {
    // console.log('[Service Worker] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    // console.log('[Service Worker] Push data:', data);

    const options = {
      body: data.body || '',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
      data: {
        url: data.url || '/',
        couponImage: data.couponImage || null,
        couponId: data.couponId || null,
        verificationId: data.verificationId || null,
        status: data.status || null
      }
    };

    // Ajouter l'image du coupon si présente
    if (data.couponImage) {
      options.image = data.couponImage;
    }

    // Ajouter les actions (boutons)
    if (data.actions) {
      options.actions = data.actions;
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options)
    );
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
    event.waitUntil(
      self.registration.showNotification('Nouvelle notification', {
        body: event.data.text(),
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  // console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Vérifier si une fenêtre avec cette URL est déjà ouverte
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Chercher une fenêtre existante
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  // console.log('[Service Worker] Notification closed:', event);
});
