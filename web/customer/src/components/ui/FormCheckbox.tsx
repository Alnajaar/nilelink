'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface FormCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  description?: string;
}

export default function FormCheckbox({
  label,
  checked,
  onChange,
  error,
  disabled = false,
  description,
}: FormCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative flex h-6 w-6 rounded-md border-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          flex-shrink-0 mt-1
          ${
            checked
              ? 'bg-primary-600 border-primary-600'
              : 'border-gray-300 bg-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-error-500' : ''}
        `}
      >
        {checked && (
          <Check className="absolute inset-0 h-full w-full text-white p-1" />
        )}
      </button>

      {label && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-xs text-text-tertiary">{description}</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-error-500 mt-1">{error}</p>}
    </div>
  );
}
