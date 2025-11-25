const CACHE_NAME = 'bible-reading-v2';
const NOTIFICATION_TAG = 'daily-bible-reading';

// ✅ تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// ✅ تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(
    clients.claim()
  );
});

// ✅ معالجة Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = {
    title: 'تذكير قراءة الكتاب المقدس',
    body: 'حان وقت قراءة الكتاب المقدس اليوم! 📖',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url: '/dashboard'
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200, 100, 200],
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    renotify: true,
    silent: false,
    data: {
      url: data.url,
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'افتح التطبيق',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ✅ معالجة الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // البحث عن نافذة مفتوحة
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // فتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ✅ معالجة الرسائل من التطبيق
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data?.type === 'TEST_NOTIFICATION') {
    const message = event.data.message || 'هذا إشعار تجريبي 📖';
    showNotification(message);
  }
  
  if (event.data?.type === 'CHECK_PERMISSION') {
    event.ports[0].postMessage({
      permission: Notification.permission
    });
  }
});

// ✅ دالة لإظهار الإشعار فوراً
function showNotification(message) {
  const options = {
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    renotify: true,
    silent: false,
    data: {
      url: '/dashboard',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'افتح التطبيق'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  return self.registration.showNotification(
    'تذكير قراءة الكتاب المقدس', 
    options
  );
}