import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
  id?: string;
}

export default function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    className = '',
    id,
    type = 'button',
    onClick,
    ...rest
  } = props;

  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:scale-[1.015] active:scale-[0.985] disabled:transform-none disabled:shadow-none';

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20',
    secondary: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40',
    outline: 'border border-gray-300 dark:border-gray-750 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/40',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-600/20 focus-visible:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm md:text-base gap-2',
    lg: 'px-6 py-3.5 text-base md:text-lg gap-2.5',
  };

  const buttonId = id || `btn-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <button
      id={buttonId}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      type={type}
      onClick={onClick}
      {...(rest as any)}
    >
      {isLoading && <Spinner size="xs" className="text-current" />}
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}
