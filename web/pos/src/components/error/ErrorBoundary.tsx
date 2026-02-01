"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';
import { Button } from '@shared/components/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    context?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Production-Grade Error Boundary for POS Terminal
 * Catches runtime errors and displays a recovery UI instead of crashing
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to console for debugging
        console.error(`ErrorBoundary [${this.props.context || 'Unknown'}]:`, error, errorInfo);

        // Update state with error details
        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Send to monitoring service (future: Sentry, LogRocket, etc.)
        this.logErrorToService(error, errorInfo);
    }

    private logErrorToService(error: Error, errorInfo: ErrorInfo) {
        // Future: Send to Sentry, DataDog, or custom logging endpoint
        const errorReport = {
            context: this.props.context || 'Unknown',
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
            url: typeof window !== 'undefined' ? window.location.href : 'N/A'
        };

        // For now, just store in localStorage for debugging
        try {
            const existingErrors = JSON.parse(localStorage.getItem('pos_error_log') || '[]');
            existingErrors.push(errorReport);
            localStorage.setItem('pos_error_log', JSON.stringify(existingErrors.slice(-20))); // Keep last 20
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/terminal';
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default POS-style error UI
            return (
                <div className="min-h-screen bg-[var(--pos-bg-primary)] flex items-center justify-center p-8 combat-bg">
                    <div className="max-w-2xl w-full">
                        <div className="bg-[var(--pos-bg-secondary)] border-2 border-[var(--pos-danger)] rounded-3xl p-12 shadow-[var(--pos-shadow-lg)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--pos-danger)] via-red-600 to-[var(--pos-danger)] animate-pulse" />

                            <div className="flex items-center justify-center mb-8">
                                <div className="w-24 h-24 bg-[var(--pos-danger-bg)] rounded-2xl flex items-center justify-center text-[var(--pos-danger)] border-4 border-[var(--pos-danger)]/30">
                                    <AlertTriangle size={48} />
                                </div>
                            </div>

                            <h1 className="text-4xl font-black uppercase text-center mb-4 text-[var(--pos-text-primary)] tracking-tighter">
                                System Error
                            </h1>

                            <p className="text-center text-[var(--pos-text-secondary)] mb-8 text-sm font-bold">
                                {this.props.context && (
                                    <span className="block text-[10px] uppercase tracking-widest text-[var(--pos-text-muted)] mb-2">
                                        [{this.props.context}]
                                    </span>
                                )}
                                A critical error occurred in the POS terminal. The system is safe, but this component needs recovery.
                            </p>

                            {this.state.error && (
                                <div className="bg-[var(--pos-bg-primary)] border border-[var(--pos-border-subtle)] rounded-xl p-6 mb-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield size={14} className="text-[var(--pos-accent)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--pos-text-muted)]">Error Details</span>
                                    </div>
                                    <p className="text-xs font-mono text-[var(--pos-danger)] break-all leading-relaxed">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant="primary"
                                    onClick={this.handleReset}
                                    className="combat-btn combat-btn-primary h-16 flex-col gap-1"
                                >
                                    <RefreshCw size={20} />
                                    <span className="text-xs">Try Again</span>
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={this.handleReload}
                                    className="combat-btn combat-btn-secondary h-16 flex-col gap-1"
                                >
                                    <RefreshCw size={20} />
                                    <span className="text-xs">Reload App</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={this.handleGoHome}
                                    className="combat-btn combat-btn-ghost h-16 flex-col gap-1"
                                >
                                    <Home size={20} />
                                    <span className="text-xs">Home</span>
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[var(--pos-border-subtle)] text-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--pos-text-muted)] opacity-50">
                                    Error logged for diagnostics • Terminal ID: {typeof window !== 'undefined' ? localStorage.getItem('nilelink_device_id')?.slice(-8) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    context?: string
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary context={context}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
