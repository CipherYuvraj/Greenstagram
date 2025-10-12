import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <div className="absolute inset-0 border-2 border-green-200 dark:border-green-800 rounded-full"></div>
      <div className="absolute inset-0 border-t-2 border-green-500 dark:border-green-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
