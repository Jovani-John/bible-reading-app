'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { saveToLocalStorage, generateId } from '@/lib/utils';

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email exists
      if (users.find((u: any) => u.email === formData.email)) {
        toast.error('البريد الإلكتروني مسجل بالفعل');
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: generateId(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
        notificationsEnabled: false
      };

      // Save user locally
      users.push(newUser);
      saveToLocalStorage('users', users);
      saveToLocalStorage('currentUser', newUser);

      // Initialize user progress
      saveToLocalStorage(`progress_${newUser.id}`, {
        userId: newUser.id,
        completedDays: [],
        notes: [],
        lastUpdated: new Date().toISOString()
      });

      // Send notification via Web3Forms
      const notificationData = {
        access_key: '6c123e70-b648-423d-882b-da0fdfd7e8fe',
        subject: '🎉 تسجيل مستخدم جديد - Bible Reading App',
        from_name: 'Bible Reading App',
        message: `
          📋 تفاصيل المستخدم الجديد:
          
          👤 الاسم: ${formData.name}
          📧 البريد الإلكتروني: ${formData.email}
          🆔 معرف المستخدم: ${newUser.id}
          📅 تاريخ التسجيل: ${new Date().toLocaleString('ar-EG')}
          
          ---
          تم إنشاء الحساب بنجاح من تطبيق قراءة الكتاب المقدس
        `
      };

      // Send the notification (don't wait for it)
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      }).catch(err => console.error('Failed to send notification:', err));

      // Show success and redirect
      toast.success('تم إنشاء الحساب بنجاح!');
      
      setTimeout(() => {
        router.push('/dashboard');
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('حدث خطأ أثناء إنشاء الحساب');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BiCross className="text-5xl text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-600">
            انضم إلينا وابدأ رحلتك مع كلمة الله
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              الاسم الكامل
            </label>
            <div className="relative">
              <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pr-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pr-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pr-10 pl-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pr-10 pl-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </motion.button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  );
}