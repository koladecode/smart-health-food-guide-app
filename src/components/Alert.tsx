import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info' | 'disclaimer';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  id
}: AlertProps) {
  const uniqueId = id || `alert-${Math.random().toString(36).substr(2, 9)}`;

  const styles = {
    success: {
      container: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
    },
    warning: {
      container: 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-800 dark:text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
    },
    error: {
      container: 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-800 dark:text-red-300',
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />,
    },
    info: {
      container: 'bg-sky-50 dark:bg-sky-950/20 border-sky-500 text-sky-800 dark:text-sky-300',
      icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />,
    },
    disclaimer: {
      container: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/30 text-gray-700 dark:text-gray-300 shadow-sm shadow-emerald-500/5',
      icon: <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />,
    }
  };

  const activeStyle = styles[variant];

  return (
    <div
      id={uniqueId}
      className={`flex items-start gap-3.5 p-4 md:p-5 border rounded-2xl transition-all duration-200 ${activeStyle.container} ${className}`}
      role="alert"
    >
      {activeStyle.icon}
      <div className="flex-1 text-sm md:text-base leading-relaxed">
        {title && (
          <h4 className="font-bold mb-1 text-gray-950 dark:text-white" id={`${uniqueId}-title`}>
            {title}
          </h4>
        )}
        <div id={`${uniqueId}-content`}>{children}</div>
      </div>
    </div>
  );
}
