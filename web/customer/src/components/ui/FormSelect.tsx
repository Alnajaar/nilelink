'use client';

import React, { useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Fragment } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function FormSelect({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Select an option',
}: FormSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`
              relative w-full px-4 py-3 rounded-xl border border-gray-300
              bg-white text-text-primary text-left transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-error-500' : ''}
            `}
          >
            <span className="block truncate font-medium">
              {selectedOption?.label || placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <ChevronsUpDown className="w-4 h-4 text-text-tertiary" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={`
                absolute z-10 w-full mt-1 bg-white border border-gray-300
                rounded-xl shadow-elevation-2 focus:outline-none
              `}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `
                    relative cursor-pointer select-none py-3 px-4
                    ${active ? 'bg-primary-50 text-primary-600' : 'text-text-primary'}
                    transition-colors duration-150
                  `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span className={selected ? 'font-semibold' : 'font-normal'}>
                        {option.label}
                      </span>
                      {selected && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && <p className="mt-2 text-sm text-error-500">{error}</p>}
    </div>
  );
}
