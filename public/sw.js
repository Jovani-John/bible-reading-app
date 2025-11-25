const CACHE_NAME = 'bible-reading-v1';
const NOTIFICATION_TAG = 'daily-bible-reading';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim()
  );
});

self.addEventListener('push', (event) => {
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
      // Silent error
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200, 100, 200],
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
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
        title: 'إغلاق',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { time, message } = event.data;
    scheduleNotification(time, message);
  }
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    const { message } = event.data;
    sendImmediateNotification(message);
  }
});

function scheduleNotification(time, message) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    sendImmediateNotification(message);
    scheduleNotification(time, message);
  }, delay);
}

function sendImmediateNotification(message) {
  const options = {
    body: message || 'حان وقت قراءة الكتاب المقدس اليوم! 📖',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
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

  self.registration.showNotification('تذكير قراءة الكتاب المقدس', options);
}