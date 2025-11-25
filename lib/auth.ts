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
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const scheduleNotification = (time: string, message: string): void => {
  // هنا ممكن نستخدم service worker للإشعارات المجدولة
  // أو نستخدم Firebase Cloud Messaging
  console.log(`Notification scheduled for ${time}: ${message}`);
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