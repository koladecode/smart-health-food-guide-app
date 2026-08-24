import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  helperText?: string;
}

export function SearchableSelect({
  label,
  placeholder = 'Search or select...',
  value,
  onChange,
  options,
  error,
  helperText
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize internal search term with current selected value when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      const selectedOption = options.find((opt) => opt.value === value);
      setSearchTerm(selectedOption ? selectedOption.label : '');
    }
  }, [value, isOpen, options]);

  // Click outside and keydown detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSearchTerm(''); // Clear on focus to allow searching everything
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full flex flex-col gap-1.5 relative text-left" ref={containerRef} id="searchable-select-container">
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          maxLength={250}
          className={`w-full rounded-xl bg-white dark:bg-gray-900 border ${
            error
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-800 focus:ring-emerald-500/20 focus:border-emerald-600'
          } pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-200`}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/20' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                No matching regions found
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
}
