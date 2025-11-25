import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'yellow';
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  height = 'md',
  color = 'primary'
}: ProgressBarProps) {
  
  const percentage = Math.round((current / total) * 100);
  
  const heightStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colorStyles = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  };
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            التقدم
          </span>
          <span className="text-sm font-bold text-primary-600">
            {current} / {total} ({percentage}%)
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightStyles[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${heightStyles[height]} ${colorStyles[color]} rounded-full`}
        />
      </div>
    </div>
  );
}