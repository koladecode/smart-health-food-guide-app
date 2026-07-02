import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  key?: any;
}

export function Card(props: CardProps) {
  const { children, className = '', hoverable = false, id, onClick, ...rest } = props;
  const cardId = id || `card-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      id={cardId}
      className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
        hoverable ? 'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1' : ''
      } ${className}`}
      onClick={onClick}
      {...(rest as any)}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      id={props.id || `card-header-${Math.random().toString(36).substr(2, 9)}`}
      className={`p-6 pb-4 border-b border-gray-50 dark:border-gray-800/40 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      id={props.id || `card-title-${Math.random().toString(36).substr(2, 9)}`}
      className={`text-lg font-bold text-gray-900 dark:text-white tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      id={props.id || `card-desc-${Math.random().toString(36).substr(2, 9)}`}
      className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      id={props.id || `card-content-${Math.random().toString(36).substr(2, 9)}`}
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      id={props.id || `card-footer-${Math.random().toString(36).substr(2, 9)}`}
      className={`p-6 pt-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800/40 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
