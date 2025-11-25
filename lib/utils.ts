import { format, isToday, isFuture, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';

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
  // متوسط 3 دقائق لكل إصحاح
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

// إضافة الدوال المفقودة
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

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    // تسجيل Service Worker أولاً
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    // طلب الإذن من المستخدم
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied by user');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const scheduleNotification = async (time: string, message: string): Promise<void> => {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('Notifications not supported or permission not granted');
      return;
    }

    // تحويل الوقت إلى تأخير بالميلي ثانية
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);

    // إذا كان الوقت المحدد قد مضى اليوم، نضيف 24 ساعة
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const delay = notificationTime.getTime() - now.getTime();

    // استخدام setTimeout للإشعارات المؤقتة
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('تذكير قراءة الكتاب المقدس', {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'bible-reading-reminder'
        });
      }
    }, delay);

    console.log(`Notification scheduled for ${time}: ${message}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// دالة لإرسال إشعار فوري (للاختبار)
export const sendTestNotification = async (message: string = 'هذا إشعار تجريبي'): Promise<void> => {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('Cannot send notification - permission not granted');
      return;
    }

    new Notification('تذكير قراءة الكتاب المقدس', {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'test-notification'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};

// دالة للتحقق من دعم الإشعارات
export const checkNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator &&
         'PushManager' in window;
};

// دوال إضافية للمساعدة في Dashboard
export const getCurrentDay = (): number => {
  const startDate = new Date('2024-01-01'); // تاريخ البدء الافتراضي
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(diffDays + 1, 61); // لا يتجاوز 61 يوم
};

export const getDayProgress = (completedDays: number[]): { percentage: number; completed: number; total: number } => {
  const completed = completedDays.length;
  const total = 61;
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