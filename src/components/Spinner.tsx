import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`} id="loading-spinner-container">
      <div
        id="loading-spinner-circle"
        className={`${sizeClasses[size]} border-emerald-200 border-t-emerald-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}
