"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiBook, FiCheckCircle, FiCalendar, FiAward } from "react-icons/fi";
import { BiCross } from "react-icons/bi";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <FiBook className="text-4xl" />,
      title: "قراءات يومية منظمة",
      description: "خطة محكمة لإنهاء العهد الجديد في شهرين",
    },
    {
      icon: <FiCheckCircle className="text-4xl" />,
      title: "تتبع التقدم",
      description: "تابع إنجازاتك وأيامك المتتالية في القراءة",
    },
    {
      icon: <FiCalendar className="text-4xl" />,
      title: "تذكيرات يومية",
      description: "احصل على إشعارات لتذكيرك بوقت القراءة",
    },
    {
      icon: <FiAward className="text-4xl" />,
      title: "ملاحظات شخصية",
      description: "اكتب تأملاتك وملاحظاتك لكل قراءة",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <BiCross className="text-6xl text-primary-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            قراءة يوم العهد الجديد
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            "لتسكن فيكم كلمة المسيح بغنى" (كولوسي 16:3)
          </p>
          <p className="text-lg text-gray-500 mt-4">
            رحلة روحية لإكمال قراءة العهد الجديد في شهرين
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-primary-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ابدأ رحلتك اليوم
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              انضم الآن وابدأ في قراءة كلمة الله بشكل منتظم ومنظم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                إنشاء حساب جديد
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/login")}
                className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-300"
              >
                تسجيل الدخول
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { number: "40", label: "يوم قراءة" },
            { number: "27", label: "سفر" },
            { number: "100%", label: "العهد الجديد" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
