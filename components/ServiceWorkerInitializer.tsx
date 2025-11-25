'use client';

import { useEffect } from 'react';
import { registerServiceWorker, restoreScheduledNotifications } from '@/lib/utils';

export default function ServiceWorkerInitializer() {
  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        const registration = await registerServiceWorker();
        
        if (registration) {
          await restoreScheduledNotifications();
        }
      } catch (error) {
        // Silent error
      }
    };

    if (typeof window !== 'undefined') {
      initServiceWorker();
    }
  }, []);

  return null;
}