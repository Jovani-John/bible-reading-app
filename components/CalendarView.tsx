import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { readingPlan } from '@/lib/readingPlan';
import { getDayStatus } from '@/lib/utils';

interface CalendarViewProps {
  completedDays: number[];
  maxDays?: number;
  columns?: number;
}

export default function CalendarView({
  completedDays,
  maxDays,
  columns = 7
}: CalendarViewProps) {
  const router = useRouter();
  
  const days = maxDays 
    ? readingPlan.slice(0, maxDays) 
    : readingPlan;
  
  const gridCols = {
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8'
  }[columns] || 'grid-cols-7';
  
  return (
    <div className={`grid ${gridCols} gap-2`}>
      {days.map((reading, index) => {
        const status = getDayStatus(reading.date, completedDays, reading.day);
        
        const statusStyles = {
          completed: 'bg-green-500 text-white shadow-md',
          current: 'bg-primary-600 text-white ring-4 ring-primary-200 shadow-lg',
          available: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          locked: 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
        };
        
        return (
          <motion.button
            key={reading.day}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
            whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
            onClick={() => {
              if (status !== 'locked') {
                router.push(`/reading/${reading.day}`);
              }
            }}
            disabled={status === 'locked'}
            className={`
              aspect-square rounded-lg flex flex-col items-center justify-center
              font-bold text-sm transition-all duration-300
              ${statusStyles[status]}
            `}
          >
            <div className="text-base">{reading.day}</div>
            {status === 'completed' && (
              <div className="text-xs mt-1">✓</div>
            )}
            {status === 'current' && (
              <div className="text-xs mt-1">اليوم</div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}