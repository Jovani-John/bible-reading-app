import { motion } from 'framer-motion';
import { FiBook, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Reading } from '@/lib/readingPlan';
import { calculateReadingTime, formatDate } from '@/lib/utils';
import Button from './ui/Button';

interface DailyReadingProps {
  reading: Reading;
  isCompleted: boolean;
  onComplete: () => void;
  onStartReading: () => void;
}

export default function DailyReading({
  reading,
  isCompleted,
  onComplete,
  onStartReading
}: DailyReadingProps) {
  
  const readingTime = calculateReadingTime(reading.readings);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            قراءة اليوم
          </h2>
          <p className="text-gray-600">{formatDate(reading.date)}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FiClock />
          <span>{readingTime} دقيقة</span>
        </div>
      </div>
      
      {/* Book Badge */}
      {reading.book && (
        <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold mb-4">
          <FiBook className="inline ml-2" />
          {reading.book}
        </div>
      )}
      
      {/* Summary */}
      {reading.summary && (
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-gray-800 mb-2">نظرة عامة:</h3>
          <p className="text-gray-700">{reading.summary}</p>
        </div>
      )}
      
      {/* Readings */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 mb-3">القراءات المطلوبة:</h3>
        <div className="flex flex-wrap gap-3">
          {reading.readings.map((r, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onStartReading}
          variant="primary"
          size="lg"
          fullWidth
        >
          ابدأ القراءة
        </Button>
        
        <Button
          onClick={onComplete}
          variant={isCompleted ? 'secondary' : 'ghost'}
          size="lg"
          className={isCompleted ? 'border-2 border-green-500 !text-green-700' : ''}
        >
          <FiCheckCircle className="text-2xl" />
        </Button>
      </div>
      
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-green-600 font-semibold"
        >
          ✓ تم إكمال قراءة اليوم
        </motion.div>
      )}
    </motion.div>
  );
}