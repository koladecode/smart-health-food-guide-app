import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[2px]',
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-[4px]',
  };

  const hasCustomColor = className.includes('text-');
  const colorClasses = hasCustomColor
    ? 'border-current/25 border-t-current'
    : 'border-slate-100 dark:border-slate-800/80 border-t-emerald-600 dark:border-t-emerald-500';

  return (
    <div className={`flex justify-center items-center ${className}`} id="loading-spinner-container">
      <div
        id="loading-spinner-circle"
        className={`${sizeClasses[size]} ${colorClasses} rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}
