"use client";

import React from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'login' | 'register';
    defaultMethod?: 'email' | 'phone' | 'wallet';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {defaultTab === 'login' ? 'Login' : 'Register'}
                </h2>
                <p className="mb-4">Authentication component - demo mode</p>
                <button
                    onClick={onClose}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
