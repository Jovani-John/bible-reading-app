import { format, isToday, isFuture, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';

// ========================================
// Storage Functions
// ========================================

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// ========================================
// Service Worker & Notifications
// ========================================

let swRegistration: ServiceWorkerRegistration | null = null;
let notificationScheduleTimer: NodeJS.Timeout | null = null;

/**
 * ✅ تسجيل Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('❌ Service Workers not supported');
    return null;
  }

  try {
    // إلغاء تسجيل أي Service Workers قديمة
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // تسجيل Service Worker جديد
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('✅ Service Worker registered:', registration);
    swRegistration = registration;

    // انتظار التفعيل
    if (registration.installing) {
      await new Promise<void>((resolve) => {
        registration.installing!.addEventListener('statechange', (e) => {
          const target = e.target as ServiceWorker;
          if (target.state === 'activated') {
            console.log('✅ Service Worker activated');
            resolve();
          }
        });
      });
    }

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

/**
 * ✅ التحقق من دعم الإشعارات
 */
export const checkNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator;
};

/**
 * ✅ طلب إذن الإشعارات (محسّن للموبايل)
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    console.log('❌ Notifications not supported');
    return false;
  }

  try {
    // التحقق من الحالة الحالية
    if (Notification.permission === 'granted') {
      console.log('✅ Permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permission denied');
      return false;
    }

    // تسجيل Service Worker أولاً
    if (!swRegistration) {
      swRegistration = await registerServiceWorker();
      if (!swRegistration) {
        console.log('❌ Failed to register Service Worker');
        return false;
      }
    }

    // طلب الإذن
    console.log('🔔 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    console.log('Permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied by user');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * ✅ إرسال إشعار تجريبي فوري
 */
export const sendTestNotification = async (message: string = 'هذا إشعار تجريبي 📖'): Promise<void> => {
  console.log('🧪 Sending test notification...');
  
  if (!checkNotificationSupport()) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  try {
    // التأكد من Service Worker
    if (!swRegistration) {
      swRegistration = await registerServiceWorker();
    }

    if (!swRegistration) {
      throw new Error('Service Worker not registered');
    }

    // إرسال رسالة للـ Service Worker
    if (swRegistration.active) {
      swRegistration.active.postMessage({
        type: 'TEST_NOTIFICATION',
        message: message
      });
      console.log('✅ Test notification sent to Service Worker');
    } else {
      // Fallback: إشعار مباشر
      new Notification('تذكير قراءة الكتاب المقدس', {
        body: message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'test-notification'
      });
      console.log('✅ Test notification sent directly');
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    throw error;
  }
};

/**
 * ✅ جدولة إشعار يومي (محسّن للموبايل)
 */
export const scheduleNotification = async (time: string, message: string): Promise<void> => {
  console.log(`📅 Scheduling notification for ${time}`);
  
  if (!checkNotificationSupport() || Notification.permission !== 'granted') {
    console.log('❌ Cannot schedule - permission not granted');
    return;
  }

  try {
    // إلغاء أي جدولة سابقة
    if (notificationScheduleTimer) {
      clearTimeout(notificationScheduleTimer);
      notificationScheduleTimer = null;
    }

    // حساب الوقت المتبقي
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // إذا فات الوقت اليوم، جدول لبكرة
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    console.log(`⏰ Next notification in ${Math.round(delay / 1000 / 60)} minutes`);

    // حفظ الجدولة
    saveToLocalStorage('notificationSchedule', {
      time,
      message,
      enabled: true,
      nextSchedule: scheduledTime.toISOString()
    });

    // جدولة الإشعار
    notificationScheduleTimer = setTimeout(async () => {
      console.log('🔔 Sending scheduled notification...');
      
      try {
        await sendTestNotification(message);
        
        // إعادة الجدولة لليوم التالي
        scheduleNotification(time, message);
      } catch (error) {
        console.error('❌ Error sending scheduled notification:', error);
      }
    }, delay);

  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
  }
};

/**
 * ✅ إلغاء جدولة الإشعارات
 */
export const cancelScheduledNotifications = (): void => {
  console.log('🚫 Cancelling scheduled notifications');
  
  if (notificationScheduleTimer) {
    clearTimeout(notificationScheduleTimer);
    notificationScheduleTimer = null;
  }
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('notificationSchedule');
  }
};

/**
 * ✅ استعادة الإشعارات المجدولة
 */
export const restoreScheduledNotifications = async (): Promise<void> => {
  console.log('🔄 Restoring scheduled notifications...');
  
  try {
    const schedule = getFromLocalStorage<{
      time: string;
      message: string;
      enabled: boolean;
    } | null>('notificationSchedule', null);

    if (schedule && schedule.enabled) {
      await scheduleNotification(schedule.time, schedule.message);
      console.log('✅ Scheduled notifications restored');
    }
  } catch (error) {
    console.error('❌ Error restoring notifications:', error);
  }
};

// ========================================
// Date Functions
// ========================================

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMMM yyyy', { locale: ar });
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM', { locale: ar });
};

export const isDayCompleted = (dayNumber: number, completedDays: number[]): boolean => {
  return completedDays.includes(dayNumber);
};

export const canAccessDay = (date: string): boolean => {
  const dayDate = new Date(date);
  return isToday(dayDate) || isPast(dayDate);
};

export const getDayStatus = (date: string, completedDays: number[], dayNumber: number): 'completed' | 'current' | 'locked' | 'available' => {
  const dayDate = new Date(date);
  
  if (isDayCompleted(dayNumber, completedDays)) {
    return 'completed';
  }
  
  if (isToday(dayDate)) {
    return 'current';
  }
  
  if (isFuture(dayDate)) {
    return 'locked';
  }
  
  return 'available';
};

export const calculateReadingTime = (readings: string[]): number => {
  return readings.length * 3;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'مساء الخير';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentDay = (): number => {
  const startDate = new Date('2024-01-01');
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(diffDays + 1, 40);
};

export const getDayProgress = (completedDays: number[]): { percentage: number; completed: number; total: number } => {
  const completed = completedDays.length;
  const total = 40;
  const percentage = Math.round((completed / total) * 100);
  
  return {
    percentage,
    completed,
    total
  };
};

export const getStreakCount = (completedDays: number[]): number => {
  if (completedDays.length === 0) return 0;
  
  const sortedDays = [...completedDays].sort((a, b) => b - a);
  let streak = 0;
  
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || sortedDays[i] === sortedDays[i - 1] - 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ساعة ${remainingMinutes > 0 ? `${remainingMinutes} دقيقة` : ''}`.trim();
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};