import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick
}: CardProps) {
  
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-lg transition-all duration-300
        ${paddingStyles[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}