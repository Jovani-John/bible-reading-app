import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiBell, FiMoon, FiSun, FiDownload, FiTrash2, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import { 
  getFromLocalStorage, 
  saveToLocalStorage, 
  requestNotificationPermission, 
  scheduleNotification,
  sendTestNotification,
  checkNotificationSupport,
  cancelScheduledNotifications,
  restoreScheduledNotifications,
  registerServiceWorker
} from '@/lib/utils';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface User {
  id: string;
  name: string;
  email: string;
  notificationsEnabled?: boolean;
  notificationTime?: string;
}

interface Note {
  day: number;
  content: string;
  tags?: string[];
}

interface Progress {
  userId: string;
  completedDays: number[];
  notes: Note[];
  lastUpdated: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    const initializePage = async () => {
      // تحميل بيانات المستخدم
      const user = getFromLocalStorage<User | null>('currentUser', null);
      if (!user) {
        router.push('/login');
        return;
      }
      
      setCurrentUser(user);
      setNotificationsEnabled(user.notificationsEnabled || false);
      setNotificationTime(user.notificationTime || '09:00');
      
      const userProgress = getFromLocalStorage<Progress>(`progress_${user.id}`, {
        userId: user.id,
        completedDays: [],
        notes: [],
        lastUpdated: new Date().toISOString()
      });
      setProgress(userProgress);

      // تحميل الوضع الليلي
      const savedDarkMode = getFromLocalStorage<boolean>('darkMode', false);
      setDarkMode(savedDarkMode);
      
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      }

      // التحقق من حالة الإشعارات
      if (checkNotificationSupport()) {
        setPermissionStatus(Notification.permission);
        
        // تسجيل Service Worker
        await registerServiceWorker();
        
        // استعادة الإشعارات المجدولة
        if (user.notificationsEnabled && Notification.permission === 'granted') {
          await restoreScheduledNotifications();
          setNotificationStatus('✅ الإشعارات مفعّلة ومجدولة');
        }
      } else {
        setNotificationStatus('⚠️ المتصفح لا يدعم الإشعارات');
      }
      
      setIsLoading(false);
    };

    initializePage();
  }, [router]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveToLocalStorage('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(newDarkMode ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري');
  };

  const toggleNotifications = async () => {
    if (!currentUser) return;

    if (!checkNotificationSupport()) {
      toast.error('المتصفح لا يدعم الإشعارات');
      return;
    }

    if (!notificationsEnabled) {
      // طلب الإذن
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        setPermissionStatus(Notification.permission);
        
        if (Notification.permission === 'denied') {
          toast.error('⚠️ يجب تفعيل الإشعارات من إعدادات المتصفح\n\nللأندرويد: الإعدادات > التطبيقات > Chrome > الإشعارات\nللآيفون: الإعدادات > Safari > الإشعارات', {
            duration: 6000
          });
        } else {
          toast.error('يجب السماح بالإشعارات');
        }
        return;
      }
      
      setPermissionStatus('granted');
      
      // جدولة الإشعار
      await scheduleNotification(notificationTime, 'حان وقت قراءة الكتاب المقدس اليوم! 📖');
      toast.success('✅ تم تفعيل الإشعارات بنجاح');
      setNotificationStatus('✅ الإشعارات مفعّلة ومجدولة');
    } else {
      // إلغاء الإشعارات
      cancelScheduledNotifications();
      toast.success('تم إيقاف الإشعارات');
      setNotificationStatus('');
    }

    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    const updatedUser: User = {
      ...currentUser,
      notificationsEnabled: newState,
      notificationTime
    };
    
    setCurrentUser(updatedUser);
    saveToLocalStorage('currentUser', updatedUser);
    
    const users = getFromLocalStorage<User[]>('users', []);
    const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
    if (userIndex > -1) {
      users[userIndex] = updatedUser;
      saveToLocalStorage('users', users);
    }
  };

  const handleTestNotification = async () => {
    if (!currentUser) return;

    if (!checkNotificationSupport()) {
      toast.error('المتصفح لا يدعم الإشعارات');
      return;
    }

    if (Notification.permission !== 'granted') {
      toast.error('يجب تفعيل الإشعارات أولاً');
      return;
    }

    setIsTestingNotification(true);
    try {
      await sendTestNotification('هذا إشعار تجريبي للتأكد من عمل الإشعارات 📖✨');
      toast.success('✅ تم إرسال إشعار تجريبي بنجاح! تحقق من الإشعارات', {
        duration: 4000
      });
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('❌ فشل إرسال الإشعار. تأكد من السماح بالإشعارات.');
    } finally {
      setIsTestingNotification(false);
    }
  };

  const saveNotificationTime = async () => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      notificationTime
    };
    
    setCurrentUser(updatedUser);
    saveToLocalStorage('currentUser', updatedUser);
    
    const users = getFromLocalStorage<User[]>('users', []);
    const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
    if (userIndex > -1) {
      users[userIndex] = updatedUser;
      saveToLocalStorage('users', users);
    }
    
    // إعادة جدولة الإشعار بالوقت الجديد
    if (notificationsEnabled && Notification.permission === 'granted') {
      await scheduleNotification(notificationTime, 'حان وقت قراءة الكتاب المقدس اليوم! 📖');
      setNotificationStatus(`✅ تم تحديث الوقت إلى ${notificationTime}`);
    }
    
    toast.success('تم حفظ وقت الإشعار بنجاح ⏰');
  };

  const exportNotes = () => {
    if (!progress || progress.notes.length === 0) {
      toast.error('لا توجد ملاحظات لتصديرها');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('My Bible Reading Notes', 105, 20, { align: 'center' });
    
    let yPosition = 40;
    
    progress.notes.forEach((note: Note) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${note.day}`, 20, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(note.content, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 7 + 10;
      
      if (note.tags && note.tags.length > 0) {
        doc.setFontSize(9);
        doc.text(`Tags: ${note.tags.join(', ')}`, 20, yPosition);
        yPosition += 10;
      }
      
      yPosition += 5;
    });
    
    doc.save('bible-reading-notes.pdf');
    toast.success('تم تصدير الملاحظات بنجاح 📄');
  };

  const clearAllData = () => {
    if (!currentUser) return;

    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      const updatedProgress: Progress = {
        userId: currentUser.id,
        completedDays: [],
        notes: [],
        lastUpdated: new Date().toISOString()
      };
      
      setProgress(updatedProgress);
      saveToLocalStorage(`progress_${currentUser.id}`, updatedProgress);
      toast.success('تم حذف جميع البيانات 🗑️');
    }
  };

  if (isLoading || !currentUser || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-xl text-gray-800 dark:text-gray-200">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <FiArrowRight className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <BiCross className="text-3xl text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">الإعدادات</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6 transition-colors duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <FiUser className="text-4xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentUser.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {progress.completedDays.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">أيام مكتملة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {progress.notes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ملاحظة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {Math.round((progress.completedDays.length / 61) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">التقدم</div>
            </div>
          </div>
        </motion.div>

        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6 transition-colors duration-300"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <FiBell className="text-primary-600 dark:text-primary-400" />
            الإشعارات اليومية
          </h3>

          <div className="space-y-6">
            {/* Permission Warning */}
            {permissionStatus === 'denied' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex items-start gap-3">
                <FiAlertCircle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <div className="font-bold mb-1">تم رفض إذن الإشعارات</div>
                  <div className="text-xs space-y-1">
                    <p><strong>للأندرويد:</strong> الإعدادات → التطبيقات → Chrome/المتصفح → الإشعارات → تفعيل</p>
                    <p><strong>للآيفون:</strong> الإعدادات → Safari → الإشعارات → السماح</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">تفعيل الإشعارات اليومية</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">تذكير يومي بوقت القراءة</div>
                {notificationStatus && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">{notificationStatus}</div>
                )}
              </div>
              <button
                onClick={toggleNotifications}
                className={`
                  relative w-14 h-8 rounded-full transition-colors duration-300
                  ${notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                    ${notificationsEnabled ? 'right-1' : 'right-7'}
                  `}
                />
              </button>
            </div>

            {notificationsEnabled && permissionStatus === 'granted' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    وقت الإشعار اليومي ⏰
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="time"
                      value={notificationTime}
                      onChange={(e) => setNotificationTime(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveNotificationTime}
                      className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                      حفظ
                    </motion.button>
                  </div>
                </div>

                {/* Test Notification Button */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">اختبار الإشعارات 🔔</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">تأكد من عمل الإشعارات بشكل صحيح</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleTestNotification}
                      disabled={isTestingNotification}
                      className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FiCheck />
                      {isTestingNotification ? 'جاري الإرسال...' : 'اختبار الآن'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6 transition-colors duration-300"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            {darkMode ? <FiMoon className="text-primary-600 dark:text-primary-400" /> : <FiSun className="text-primary-600" />}
            المظهر
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">الوضع الليلي</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">تفعيل الوضع المظلم</div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`
                relative w-14 h-8 rounded-full transition-colors duration-300
                ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                  ${darkMode ? 'right-1' : 'right-7'}
                `}
              />
            </button>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6 transition-colors duration-300"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            إدارة البيانات
          </h3>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportNotes}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
            >
              <FiDownload />
              تصدير الملاحظات كـ PDF
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAllData}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
            >
              <FiTrash2 />
              حذف جميع البيانات
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-colors duration-300"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            روابط سريعة
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-right px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-semibold"
            >
              → الصفحة الرئيسية
            </button>
            <button
              onClick={() => router.push('/notes')}
              className="w-full text-right px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-semibold"
            >
              → ملاحظاتي
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}