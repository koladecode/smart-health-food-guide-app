import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, endIcon, className = '', type = 'text', ...props }, ref) => {
    const uniqueId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5" id={`${uniqueId}-wrapper`}>
        {label && (
          <label
            htmlFor={uniqueId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={uniqueId}
            type={type}
            className={`w-full rounded-xl bg-white dark:bg-gray-900 border ${
              error
                ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500 hover:border-red-400'
                : 'border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-750 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-400'
            } ${icon ? 'pl-11' : 'px-4'} ${endIcon ? 'pr-11' : 'pr-4'} py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-200 ease-out disabled:opacity-50 disabled:bg-gray-50/40 dark:disabled:bg-gray-950/20 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
            {...props}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-0.5" id={`${uniqueId}-error`}>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" id={`${uniqueId}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className = '', ...props }, ref) => {
    const uniqueId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5" id={`${uniqueId}-wrapper`}>
        {label && (
          <label
            htmlFor={uniqueId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={uniqueId}
          className={`w-full rounded-xl bg-white dark:bg-gray-900 border ${
            error
              ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500 hover:border-red-400'
              : 'border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-750 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-400'
          } px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-200 ease-out disabled:opacity-50 disabled:bg-gray-50/40 dark:disabled:bg-gray-950/20 disabled:cursor-not-allowed disabled:pointer-events-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0aec0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat ${className}`}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              {opt.label}
            </option>
          )) : children}
        </select>
        {error && (
          <p className="text-xs text-red-500 mt-0.5" id={`${uniqueId}-error`}>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" id={`${uniqueId}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const uniqueId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5" id={`${uniqueId}-wrapper`}>
        {label && (
          <label
            htmlFor={uniqueId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={uniqueId}
          className={`w-full rounded-xl bg-white dark:bg-gray-900 border ${
            error
              ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500 hover:border-red-400'
              : 'border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-750 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-400'
          } px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-200 ease-out disabled:opacity-50 disabled:bg-gray-50/40 dark:disabled:bg-gray-950/20 disabled:cursor-not-allowed disabled:pointer-events-none min-h-[100px] ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-0.5" id={`${uniqueId}-error`}>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" id={`${uniqueId}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
