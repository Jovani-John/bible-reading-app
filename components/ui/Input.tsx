import { ChangeEvent } from 'react';
import { IconType } from 'react-icons';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'time' | 'date' | 'number';
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  icon?: IconType;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  required = false,
  disabled = false,
  className = ''
}: InputProps) {
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-700 font-semibold mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border-2 border-gray-200 rounded-xl
            focus:border-primary-500 focus:outline-none transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${Icon ? 'pr-10' : ''}
            ${className}
          `}
        />
      </div>
    </div>
  );
}