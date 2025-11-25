import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

interface StreakCounterProps {
  streak: number;
  maxStreak?: number;
}

export default function StreakCounter({ streak, maxStreak = 0 }: StreakCounterProps) {
  
  const isNewRecord = streak > maxStreak;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <FiAward className="text-4xl" />
        {isNewRecord && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          >
            <FiTrendingUp />
            رقم قياسي!
          </motion.div>
        )}
      </div>
      
      <div className="mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl font-bold mb-1"
        >
          {streak}
        </motion.div>
        <div className="text-lg opacity-90">
          {streak === 1 ? 'يوم متتالي' : 'أيام متتالية'}
        </div>
      </div>
      
      {maxStreak > 0 && !isNewRecord && (
        <div className="text-sm opacity-75 flex items-center gap-2">
          <span>أفضل سلسلة: {maxStreak} {maxStreak === 1 ? 'يوم' : 'أيام'}</span>
        </div>
      )}
      
      {streak === 0 && (
        <p className="text-sm opacity-90 mt-2">
          ابدأ سلسلتك اليوم! 🎯
        </p>
      )}
      
      {streak >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm bg-white/20 rounded-lg p-2 text-center"
        >
          🔥 رائع! استمر في التقدم
        </motion.div>
      )}
    </motion.div>
  );
}