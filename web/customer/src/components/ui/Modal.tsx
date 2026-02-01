'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeButton = true,
  size = 'md',
  className = '',
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1050]" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`
                  w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl
                  bg-white p-6 text-left align-middle shadow-elevation-3
                  transition-all ${className}
                `}
              >
                {/* Header */}
                {(title || closeButton) && (
                  <div className="flex items-center justify-between mb-6">
                    {title && (
                      <Dialog.Title className="text-xl font-bold text-text-primary">
                        {title}
                      </Dialog.Title>
                    )}
                    {closeButton && (
                      <button
                        onClick={onClose}
                        className="ml-auto p-2 text-text-tertiary hover:text-text-primary transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
