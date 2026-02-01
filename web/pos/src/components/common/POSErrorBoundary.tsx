'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCcw, Home, MessageSquare } from 'lucide-react';
import { auditLogger, AuditLevel } from '@/shared/services/AuditLogger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class POSErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 1. Log to our new Audit Service
        auditLogger.log(
            AuditLevel.CRITICAL,
            'SYSTEM_CRASH_CAUGHT',
            {
                errorMessage: error.message,
                componentStack: errorInfo.componentStack,
                userAgent: navigator.userAgent
            },
            { id: 'system', name: 'Error Boundary', role: 'SYSTEM' }
        ).catch(console.error);

        // 2. Also log to standard console for developers
        console.error('POSErrorBoundary caught an error:', error, errorInfo);

        this.setState({ errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-slate-800 border-2 border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertOctagon className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Terminal Interruption</h1>
                        <p className="text-gray-400 mb-8">
                            An unexpected error occurred in this terminal. The safe state has been preserved and logged.
                        </p>

                        <div className="bg-slate-900/50 rounded-xl p-4 mb-8 text-left border border-slate-700">
                            <p className="text-xs font-mono text-red-400 break-words">
                                ERROR: {this.state.error?.message || 'Unknown Execution Error'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                <span>Restart Application</span>
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
                            >
                                <Home className="w-5 h-5" />
                                <span>Return to Dashboard</span>
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-gray-300">
                                <MessageSquare className="w-4 h-4" />
                                <span>Report Bug</span>
                            </button>
                            <span>|</span>
                            <span>ID: {Date.now().toString(36)}</span>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
