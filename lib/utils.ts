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
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
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