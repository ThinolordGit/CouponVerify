/**
 * src/services/pushNotificationService.js - Push Notification Service
 * Manages service worker registration and push subscriptions with UUID
 */

import api from './api';
import { getUserUUID } from '../utils/uuid';

/**
 * Initialize the push notification system
 */
export const initPushNotifications = async () => {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator)) {
      // console.log('[Push] Service Workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      // console.log('[Push] Push Manager not supported');
      return false;
    }

    if (!('Notification' in window)) {
      // console.log('[Push] Notifications not supported');
      return false;
    }

    // Register service worker
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      // console.log('[Push] Service Worker registered');
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Push] Init error:', error);
    return false;
  }
};

/**
 * Subscribe to push notifications with UUID
 */
export const subscribeToPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from backend
    const publicKeyResponse = await api.get('/api/push/public-key');
    const publicKey = publicKeyResponse?.data?.publicKey;
    
    if (!publicKey) {
      console.error('[Push] No public key available');
      return null;
    }

    // Create push subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    // Get user UUID
    const userUUID = getUserUUID();

    // Send subscription to backend with UUID instead of IP
    await api.post('/api/push/subscribe', {
      subscription: subscription.toJSON(),
      user_uuid: userUUID,
      user_agent: navigator.userAgent
    });

    // console.log('[Push] Subscribed successfully with UUID:', userUUID);
    return subscription;
  } catch (error) {
    console.error('[Push] Subscription error:', error);
    return null;
  }
};

/**
 * Convert base64 URL string to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Show local notification (for client after submission)
 */
export const showLocalNotification = (title, options = {}) => {
  if (!('serviceWorker' in navigator)) {
    // console.log('[Push] Service Workers not supported');
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(title, {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'local-notification',
      ...options
    });
  });
};

/**
 * Check if notifications are enabled
 */
export const notificationsEnabled = () => {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    Notification.permission === 'granted'
  );
};

export default {
  initPushNotifications,
  subscribeToPush,
  showLocalNotification,
  notificationsEnabled
};
