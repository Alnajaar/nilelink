'use client';

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function FormInput({
  label,
  error,
  helper,
  icon,
  fullWidth = true,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary">{icon}</div>}

        <input
          className={`
            w-full px-4 py-3 ${icon ? 'pl-12' : ''} rounded-xl
            border border-gray-300 bg-white text-text-primary
            placeholder-text-tertiary transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <p className="mt-2 text-sm text-error-500">{error}</p>}
      {helper && !error && (
        <p className="mt-2 text-sm text-text-tertiary">{helper}</p>
      )}
    </div>
  );
}
