'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiBook, FiCalendar, FiSettings, FiLogOut, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import { getTodayReading, getProgressPercentage, getStreak, readingPlan } from '@/lib/readingPlan';
import { getFromLocalStorage, saveToLocalStorage, getGreeting, formatDate, getDayStatus } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [todayReading, setTodayReading] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const user = getFromLocalStorage('currentUser', null);
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
    const userProgress = getFromLocalStorage(`progress_${user.id}`, {
      userId: user.id,
      completedDays: [],
      notes: [],
      lastUpdated: new Date().toISOString()
    });
    setProgress(userProgress);
    setTodayReading(getTodayReading());
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/');
  };

  const toggleDayCompletion = (dayNumber: number) => {
    if (!progress) return;
    
    const completedDays = [...progress.completedDays];
    const index = completedDays.indexOf(dayNumber);
    
    if (index > -1) {
      completedDays.splice(index, 1);
      toast.success('تم إلغاء تحديد اليوم');
    } else {
      completedDays.push(dayNumber);
      toast.success('أحسنت! تم إكمال القراءة');
    }
    
    const updatedProgress = {
      ...progress,
      completedDays,
      lastUpdated: new Date().toISOString()
    };
    
    setProgress(updatedProgress);
    saveToLocalStorage(`progress_${currentUser.id}`, updatedProgress);
  };

  if (!currentUser || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(progress.completedDays);
  const streak = getStreak(progress.completedDays);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BiCross className="text-3xl text-primary-600" />
            <span className="text-xl font-bold text-gray-800">قراءة يوم</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiSettings className="text-2xl" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="text-2xl" />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getGreeting()}، {currentUser.name}
          </h1>
          <p className="text-gray-600">
            استمر في رحلتك مع كلمة الله
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <FiCheckCircle className="text-4xl text-green-500" />
              <span className="text-3xl font-bold text-gray-800">
                {progress.completedDays.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-semibold">أيام مكتملة</h3>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{progressPercentage}% من الخطة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <FiAward className="text-4xl text-yellow-500" />
              <span className="text-3xl font-bold text-gray-800">
                {streak}
              </span>
            </div>
            <h3 className="text-gray-600 font-semibold">أيام متتالية</h3>
            <p className="text-sm text-gray-500 mt-2">
              {streak > 0 ? 'استمر في التقدم الرائع!' : 'ابدأ سلسلتك اليوم'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <FiBook className="text-4xl text-blue-500" />
              <span className="text-3xl font-bold text-gray-800">
                {61 - progress.completedDays.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-semibold">أيام متبقية</h3>
            <p className="text-sm text-gray-500 mt-2">
              من أصل 61 يوم
            </p>
          </motion.div>
        </div>

        {/* Today's Reading */}
        {todayReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">قراءة اليوم</h2>
              <span className="text-sm text-gray-500">{formatDate(new Date())}</span>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                {todayReading.readings.map((reading: string, index: number) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold"
                  >
                    {reading}
                  </span>
                ))}
              </div>
              
              {todayReading.summary && (
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
                  <p className="text-gray-700">{todayReading.summary}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/reading/${todayReading.day}`)}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ابدأ القراءة
              </motion.button>
              
              {progress.completedDays.includes(todayReading.day) ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDayCompletion(todayReading.day)}
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-bold border-2 border-green-500"
                >
                  <FiCheckCircle className="text-2xl" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDayCompletion(todayReading.day)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
                >
                  تم
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Reading Plan Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">خطة القراءة</h2>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              {showCalendar ? 'إخفاء' : 'عرض الكل'}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {readingPlan.slice(0, showCalendar ? readingPlan.length : 14).map((reading) => {
              const status = getDayStatus(reading.date, progress.completedDays, reading.day);
              
              return (
                <motion.button
                  key={reading.day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    if (status !== 'locked') {
                      router.push(`/reading/${reading.day}`);
                    }
                  }}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center font-bold text-sm
                    transition-all duration-300
                    ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                    ${status === 'current' ? 'bg-primary-600 text-white ring-4 ring-primary-200' : ''}
                    ${status === 'available' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                    ${status === 'locked' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
                  `}
                  disabled={status === 'locked'}
                >
                  {reading.day}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}