'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Button from './ui/Button';
import { 
  requestNotificationPermission, 
  sendTestNotification, 
  checkNotificationSupport,
  scheduleNotification,
  cancelScheduledNotifications 
} from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  enabled: boolean;
  time: string;
  onToggle: () => void;
  onTimeChange: (time: string) => void;
  onSave: () => void;
}

export default function NotificationSettings({
  enabled,
  time,
  onToggle,
  onTimeChange,
  onSave
}: NotificationSettingsProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSupported, setIsSupported] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // التحقق من الدعم
    setIsSupported(checkNotificationSupport());
    
    // التحقق من iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
    // الحصول على حالة الإذن
    if (checkNotificationSupport()) {
      setPermissionStatus(Notification.permission);
    }
  }, []);
  
  const handleToggle = async () => {
    if (!isSupported) {
      toast.error('المتصفح لا يدعم الإشعارات');
      return;
    }

    if (!enabled) {
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        setPermissionStatus(Notification.permission);
        
        if (Notification.permission === 'denied') {
          const message = isIOS 
            ? 'للآيفون: الإعدادات → Safari → الإشعارات → السماح'
            : 'للأندرويد: الإعدادات → التطبيقات → المتصفح → الإشعارات → تفعيل';
          
          toast.error(`⚠️ يجب تفعيل الإشعارات من إعدادات الهاتف\n\n${message}`, {
            duration: 6000
          });
        } else {
          toast.error('يجب السماح بالإشعارات');
        }
        return;
      }
      
      setPermissionStatus('granted');
      
      // جدولة الإشعار
      await scheduleNotification(time, 'حان وقت قراءة الكتاب المقدس اليوم! 📖');
      toast.success('✅ تم تفعيل الإشعارات بنجاح');
    } else {
      // إلغاء الإشعارات
      cancelScheduledNotifications();
      toast.success('تم إيقاف الإشعارات');
    }
    
    onToggle();
  };

  const handleTestNotification = async () => {
    if (!isSupported) {
      toast.error('المتصفح لا يدعم الإشعارات');
      return;
    }

    if (permissionStatus !== 'granted') {
      toast.error('يجب تفعيل الإشعارات أولاً');
      return;
    }

    setIsTesting(true);
    try {
      await sendTestNotification('هذا إشعار تجريبي للتأكد من عمل الإشعارات 📖✨');
      toast.success('✅ تم إرسال إشعار تجريبي! تحقق من الإشعارات', {
        duration: 4000
      });
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('❌ فشل إرسال الإشعار. تحقق من الأذونات');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (enabled && permissionStatus === 'granted') {
      await scheduleNotification(time, 'حان وقت قراءة الكتاب المقدس اليوم! 📖');
    }
    onSave();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-colors">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <FiBell className="text-primary-600 dark:text-primary-400" />
        إعدادات الإشعارات
      </h3>
      
      <div className="space-y-6">
        {/* iOS Warning */}
        {isIOS && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4 flex items-start gap-3">
            <FiInfo className="text-blue-600 dark:text-blue-400 text-xl flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-bold mb-1">📱 ملاحظة لمستخدمي iPhone</div>
              <div className="text-xs">
                • يجب تثبيت التطبيق على الشاشة الرئيسية من Safari<br/>
                • الإشعارات لا تعمل في Chrome أو Firefox على iOS<br/>
                • يتطلب iOS 16.4 أو أحدث
              </div>
            </div>
          </div>
        )}

        {/* Permission Denied Warning */}
        {permissionStatus === 'denied' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex items-start gap-3">
            <FiAlertCircle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <div className="font-bold mb-1">⚠️ تم رفض إذن الإشعارات</div>
              <div className="text-xs space-y-1">
                {isIOS ? (
                  <>
                    <p><strong>الحل:</strong> الإعدادات → Safari → الإشعارات → السماح</p>
                    <p>ثم أعد تحميل التطبيق</p>
                  </>
                ) : (
                  <>
                    <p><strong>للأندرويد:</strong> الإعدادات → التطبيقات → المتصفح → الإشعارات → تفعيل</p>
                    <p>ثم أعد تحميل الصفحة</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Not Supported Warning */}
        {!isSupported && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-4 flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <div className="font-bold mb-1">❌ الإشعارات غير مدعومة</div>
              <div className="text-xs">
                المتصفح الحالي لا يدعم الإشعارات. جرب استخدام Chrome أو Safari.
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-100">تفعيل الإشعارات اليومية</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">تذكير يومي بوقت القراءة</div>
            {enabled && permissionStatus === 'granted' && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">✅ الإشعارات مفعّلة</div>
            )}
          </div>
          
          <button
            onClick={handleToggle}
            disabled={!isSupported}
            className={`
              relative w-14 h-8 rounded-full transition-colors duration-300
              ${enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}
              ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                ${enabled ? 'right-1' : 'right-7'}
              `}
            />
          </button>
        </div>
        
        {/* Time Picker */}
        {enabled && permissionStatus === 'granted' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                وقت الإشعار اليومي ⏰
              </label>
              <div className="flex gap-4">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />
                <Button
                  onClick={handleSave}
                  variant="primary"
                >
                  حفظ
                </Button>
              </div>
            </div>

            {/* Test Notification Button */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">اختبار الإشعارات 🔔</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">تأكد من عمل الإشعارات بشكل صحيح</div>
                </div>
                <Button
                  onClick={handleTestNotification}
                  variant="secondary"
                  disabled={isTesting || !isSupported}
                  className="flex items-center gap-2"
                >
                  <FiCheck />
                  {isTesting ? 'جاري الإرسال...' : 'اختبار'}
                </Button>
              </div>
            </div>

            {/* Info Note */}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              💡 <strong>ملاحظة:</strong> الإشعارات تعمل بشكل أفضل عندما يكون التطبيق مثبت على الشاشة الرئيسية كـ PWA
            </div>
          </div>
        )}
      </div>
    </div>
  );
}