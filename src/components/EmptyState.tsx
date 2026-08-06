import React, { useId } from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  id?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  id
}: EmptyStateProps) {
  const generatedId = useId();
  const uniqueId = id || `empty-${generatedId}`;

  return (
    <div
      id={uniqueId}
      className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-gray-100 dark:border-gray-800/60 rounded-3xl bg-gray-50/20 dark:bg-gray-900/10"
    >
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-5" id={`${uniqueId}-icon-container`}>
        {icon || <Sparkles className="w-8 h-8" />}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2" id={`${uniqueId}-title`}>
        {title}
      </h3>
      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed" id={`${uniqueId}-description`}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md" id={`${uniqueId}-action`}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
