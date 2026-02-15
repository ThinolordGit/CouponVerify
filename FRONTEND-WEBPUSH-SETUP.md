# Web Push Notifications - Frontend Setup

Ce guide décrit l'implémentation des notifications web push côté frontend.

## 📦 Structure des fichiers

```
src/
├── App.jsx                              # Initialise les push notifications
├── services/
│   ├── pushNotificationService.js       # Service pour gérer les notifications push
│   └── api.js                           # Client API
└── pages/
    └── coupon-verification/
        └── index.jsx                    # Affiche notification locale après soumission

public/
└── service-worker.js                    # Service worker pour gérer les push
```

## 🚀 Initialisation automatique

Au montage de l'application (`App.jsx`):

```javascript
useEffect(() => {
  // 1. Initialiser le service worker
  const initialized = await initPushNotifications();
  
  // 2. S'enregistrer aux notifications push
  if (initialized) {
    const subscribed = await subscribeToPush();
  }
}, []);
```

### Que fait `initPushNotifications()`?

1. Vérifie la compatibilité du navigateur
2. Enregistre le service worker (`public/service-worker.js`)
3. Demande les permissions de notification
4. Retourne `true` si succès

### Que fait `subscribeToPush()`?

1. Obtient la clé publique VAPID du backend
2. Crée une subscription push
3. Envoie la subscription au backend via `POST /api/push/subscribe`

## 🔔 Notification après soumission de vérification

Lors de la soumission d'une vérification (`pages/coupon-verification/index.jsx`):

```javascript
// Afficher une notification locale
showLocalNotification('Your request has been received!', {
  body: 'We have received your information. You will be informed as soon as possible.',
  tag: 'verification-submitted',
  requireInteraction: false
});
```

## 📨 Réception des notifications du backend

### Service Worker (`public/service-worker.js`)

Le service worker reçoit les notifications push du backend et les affiche.

**Notification pour un admin (nouvelle vérification):**
```json
{
  "title": "Checking - PCS Mastercard",
  "body": "A new PCS Mastercard check for an amount of 50 EUR has been launched\nFrom: user@example.com",
  "couponImage": "https://...",
  "couponId": 1,
  "verificationId": 123,
  "url": "http://localhost:4028/admin-dashboard/verifications",
  "requireInteraction": true
}
```

**Notification pour un client (mise à jour de statut):**
```json
{
  "title": "Verification Status Updated - ✓ Approved",
  "body": "Your coupon has been verified successfully and is valid.",
  "couponImage": "https://...",
  "couponId": 1,
  "verificationId": 123,
  "status": "approved",
  "url": "http://localhost:4028/user-dashboard",
  "requireInteraction": true
}
```

### Comportement du Service Worker

1. **Réception**: `self.addEventListener('push')`
2. **Affichage**: `self.registration.showNotification()`
3. **Clic**: `self.addEventListener('notificationclick')`
4. **Navigation**: Vers l'URL spécifiée dans les données

## 🧪 Test des notifications

### 1. Vérifier le service worker

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});
```

### 2. Vérifier la permission

```javascript
console.log('Notification permission:', Notification.permission);
```

### 3. Vérifier la subscription

```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub);
  });
});
```

### 4. Afficher une notification locale

```javascript
import { showLocalNotification } from './services/pushNotificationService';

showLocalNotification('Test Notification', {
  body: 'This is a test notification',
  tag: 'test',
  requireInteraction: false
});
```

## 🔧 Configuration

### Variables d'environnement (frontend)

Généralement, le frontend utilise les URLs du backend configurées dans les services:

```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

// Récupérer la clé publique VAPID
GET /api/push/public-key

// S'enregistrer aux push notifications
POST /api/push/subscribe
```

## 📱 Permissions

Les utilisateurs doivent accepter les permissions suivantes:

1. **Notifications**: Pour afficher les notifications push
2. **Accès au service worker**: Automatique

Le navigateur demandera les permissions:
- À la première visite (généralement)
- Ou lors de l'appel à `Notification.requestPermission()`

## ⚙️ Compatibility

| Navigateur | Support | Version min |
|-----------|---------|------------|
| Chrome    | ✅      | 50+        |
| Firefox   | ✅      | 44+        |
| Edge      | ✅      | 17+        |
| Safari    | ✅      | 16+        |
| Opera     | ✅      | 37+        |
| IE        | ❌      | N/A        |

## 🐛 Troubleshooting

### Les notifications ne s'affichent pas

1. **Vérifier les permissions**:
   ```javascript
   if (Notification.permission === 'denied') {
     console.warn('User denied notifications');
   }
   ```

2. **Vérifier le service worker**:
   ```
   DevTools → Application → Service Workers
   ```

3. **Vérifier la subscription**:
   ```
   DevTools → Application → Service Workers → Push
   ```

### L'initialisation échoue

1. Vérifier la compatibilité du navigateur
2. Vérifier la console pour les erreurs
3. Vérifier que l'API du backend est accessible

### Service worker not registering

1. Vérifier que `/service-worker.js` existe dans `public/`
2. Vérifier les permissions du serveur
3. Vérifier la console pour les erreurs

## 📚 API Reference

### `initPushNotifications()`

Initialise les notifications push.

**Returns**: `Promise<boolean>`

```javascript
const initialized = await initPushNotifications();
if (initialized) {
  console.log('Push notifications initialized');
}
```

### `subscribeToPush()`

S'enregistre aux notifications push.

**Returns**: `Promise<PushSubscription|null>`

```javascript
const subscription = await subscribeToPush();
if (subscription) {
  console.log('Subscribed to push notifications');
}
```

### `showLocalNotification(title, options)`

Affiche une notification locale.

**Parameters**:
- `title` (string): Titre de la notification
- `options` (object): Options de notification

```javascript
showLocalNotification('Hello!', {
  body: 'This is a notification',
  icon: '/icon.png',
  badge: '/badge.png',
  tag: 'my-notification',
  requireInteraction: false,
  data: { url: '/' }
});
```

### `notificationsEnabled()`

Vérifie si les notifications sont activées.

**Returns**: `boolean`

```javascript
if (notificationsEnabled()) {
  console.log('Notifications are enabled');
}
```

## 🔐 Sécurité

- Les clés VAPID privées ne sont jamais exposées au frontend
- Les subscriptions sont validées côté serveur
- Les notifications sont signées avec les clés VAPID
- Les URLs de notification sont validées

## 📖 Ressources

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
