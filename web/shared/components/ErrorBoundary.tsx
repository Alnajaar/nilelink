'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                        <div className="text-6xl mb-6">🤕</div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6">
                            We encountered an unexpected error. The application has been paused to protect your data.
                        </p>

                        {/* Dev Only Error details */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-50 p-4 rounded-lg mb-6 text-left overflow-auto max-h-40 text-xs font-mono text-red-700">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}