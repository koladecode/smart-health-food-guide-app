import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  id
}: ModalProps) {
  const uniqueId = id || `modal-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      id={uniqueId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${uniqueId}-title` : undefined}
    >
      {/* Backdrop overlay */}
      <div
        id={`${uniqueId}-backdrop`}
        className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card content */}
      <div
        id={`${uniqueId}-content-card`}
        className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform scale-100 z-10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800" id={`${uniqueId}-header`}>
          {title ? (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white" id={`${uniqueId}-title`}>
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            id={`${uniqueId}-close-btn`}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] text-gray-600 dark:text-gray-300" id={`${uniqueId}-body`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-end gap-3" id={`${uniqueId}-footer`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
