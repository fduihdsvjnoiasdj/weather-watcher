import { useState } from 'react';

const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_VAPID_KEY_HERE';

/**
 * Converts a base64 string to a UInt8Array. Required by the Push API for
 * specifying the VAPID key.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  /**
   * Requests notification permission and subscribes user to push notifications
   * if permission is granted.
   */
  async function enableNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Prohlížeč nepodporuje push notifikace.');
      return;
    }
    const permissionResult = await Notification.requestPermission();
    setPermission(permissionResult);
    if (permissionResult !== 'granted') {
      alert('Bez povolení nelze zasílat upozornění.');
      return;
    }
    // get service worker registration
    const registration = await navigator.serviceWorker.ready;
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      setSubscription(existingSub);
      return existingSub;
    }
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    setSubscription(newSubscription);
    // send subscription to server
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription),
      });
    } catch (err) {
      console.error('Failed to register push subscription:', err);
    }
    return newSubscription;
  }

  /**
   * Schedules a notification based on time and rules by sending a request to
   * the backend. The server is responsible for evaluating rules and sending
   * push notifications at the correct time.
   */
  async function scheduleNotification(time: string, rules: any[]) {
    if (!subscription) {
      return;
    }
    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, time, rules }),
      });
    } catch (err) {
      console.error('Failed to schedule notification:', err);
    }
  }

  return { permission, subscription, enableNotifications, scheduleNotification };
}