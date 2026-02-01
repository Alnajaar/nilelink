'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { auditLogger, AuditLevel } from '@/shared/services/AuditLogger';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    actionName: string;
    requiredRole?: string;
}

export function SecurityChallenge({ isOpen, onClose, onSuccess, actionName, requiredRole = 'MANAGER' }: Props) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
            setIsVerifying(false);
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit);
            setError('');
        }
    };

    const handleClear = () => {
        setPin('');
        setError('');
    };

    const handleVerify = async () => {
        if (pin.length < 4) return;

        setIsVerifying(true);
        setError('');

        // Simulation: In production, this would call Firebase or your custom Auth API
        setTimeout(() => {
            if (pin === '1234') { // Mock PIN
                setIsSuccess(true);
                auditLogger.log(
                    AuditLevel.SECURITY,
                    'SECURITY_CHALLENGE_PASSED',
                    { actionName, requiredRole },
                    { id: 'u1', name: 'Authorized User', role: requiredRole }
                );

                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1000);
            } else {
                setIsVerifying(false);
                setError('Invalid authorization code. Attempt logged.');
                setPin('');

                auditLogger.log(
                    AuditLevel.SECURITY,
                    'SECURITY_CHALLENGE_FAILED',
                    { actionName, attemptedPin: '****' },
                    { id: 'unknown', name: 'Unauthorized Attempt', role: 'UNKNOWN' }
                );
            }
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                        {isSuccess ? (
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        ) : (
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">Security Verification</h2>
                    <p className="text-gray-400 text-sm">
                        Authorization required for: <span className="text-blue-400 font-semibold">{actionName}</span>
                    </p>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* PIN Display */}
                    <div className="flex justify-center space-x-4 mb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i
                                    ? 'bg-blue-400 border-blue-400 scale-125 shadow-[0_0_10px_rgba(96,165,250,0.5)]'
                                    : 'border-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg text-sm border border-red-500/20 animate-shake">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Verify'].map((key) => (
                            <button
                                key={key}
                                onClick={() => {
                                    if (key === 'Clear') handleClear();
                                    else if (key === 'Verify') handleVerify();
                                    else handlePinInput(key);
                                }}
                                disabled={isVerifying || isSuccess || (key === 'Verify' && pin.length < 4)}
                                className={`h-16 rounded-2xl flex items-center justify-center text-xl font-bold transition-all ${key === 'Verify'
                                    ? 'col-span-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                                    : key === 'Clear'
                                        ? 'bg-slate-800 text-gray-400 hover:text-white'
                                        : 'bg-slate-800 text-white hover:bg-slate-700'
                                    }`}
                            >
                                {key === 'Verify' ? (
                                    isVerifying ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Lock className="w-5 h-5" />
                                    )
                                ) : key}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-xs text-gray-500">
                        Institutional Grade Security Policy Applied.
                        Access code restricted to <span className="text-gray-300">{requiredRole}</span> level.
                    </p>
                </div>
            </div>
        </div>
    );
}
