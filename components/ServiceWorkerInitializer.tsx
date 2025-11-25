'use client';

import { useEffect } from 'react';
import { registerServiceWorker, restoreScheduledNotifications, getFromLocalStorage } from '@/lib/utils';

export default function ServiceWorkerInitializer() {
  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        console.log('🚀 Initializing Service Worker...');
        
        // تسجيل Service Worker
        const registration = await registerServiceWorker();
        
        if (registration) {
          console.log('✅ Service Worker registered successfully');
          
          // التحقق من وجود مستخدم مسجل
          const currentUser = getFromLocalStorage('currentUser', null);
          
          if (currentUser?.notificationsEnabled) {
            console.log('👤 User has notifications enabled, restoring...');
            await restoreScheduledNotifications();
          }
        } else {
          console.log('⚠️ Service Worker registration failed');
        }
      } catch (error) {
        console.error('❌ Service Worker initialization error:', error);
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // تشغيل بعد تحميل الصفحة
      if (document.readyState === 'complete') {
        initServiceWorker();
      } else {
        window.addEventListener('load', initServiceWorker);
        return () => window.removeEventListener('load', initServiceWorker);
      }
    }
  }, []);

  return null;
}