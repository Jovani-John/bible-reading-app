'use client';

import { useState } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import Button from './ui/Button';
import { requestNotificationPermission, sendTestNotification, checkNotificationSupport } from '@/lib/utils';
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
  
  const handleToggle = async () => {
    if (!enabled) {
      // التحقق من دعم الإشعارات
      if (!checkNotificationSupport()) {
        toast.error('المتصفح لا يدعم الإشعارات');
        return;
      }

      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('يجب السماح بالإشعارات أولاً');
        return;
      }
      
      toast.success('تم تفعيل الإشعارات بنجاح');
    }
    onToggle();
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await sendTestNotification('هذا إشعار تجريبي للتأكد من عمل الإشعارات');
      toast.success('تم إرسال إشعار تجريبي');
    } catch (error) {
      toast.error('فشل إرسال الإشعار التجريبي');
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiBell className="text-primary-600" />
        إعدادات الإشعارات
      </h3>
      
      <div className="space-y-6">
        {/* Toggle Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">تفعيل الإشعارات اليومية</div>
            <div className="text-sm text-gray-600">تذكير يومي بوقت القراءة</div>
          </div>
          
          <button
            onClick={handleToggle}
            className={`
              relative w-14 h-8 rounded-full transition-colors duration-300
              ${enabled ? 'bg-primary-600' : 'bg-gray-300'}
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
        {enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                وقت الإشعار
              </label>
              <div className="flex gap-4">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                />
                <Button
                  onClick={onSave}
                  variant="primary"
                >
                  حفظ
                </Button>
              </div>
            </div>

            {/* Test Notification Button */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">اختبار الإشعارات</div>
                  <div className="text-sm text-gray-600">تأكد من عمل الإشعارات</div>
                </div>
                <Button
                  onClick={handleTestNotification}
                  variant="secondary"
                  disabled={isTesting}
                  className="flex items-center gap-2"
                >
                  <FiCheck />
                  {isTesting ? 'جاري الإرسال...' : 'اختبار'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}