"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({ errorInfo });

        // Call the onError callback if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {this.props.showDetails && this.state.error && (
                            <details className="mb-6 text-left bg-gray-50 rounded p-3">
                                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                                    Error Details
                                </summary>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleRetry}
                                variant="primary"
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                                className="flex-1 sm:flex-none"
                            >
                                Try Again
                            </Button>

                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                leftIcon={<Home className="w-4 h-4" />}
                                className="flex-1 sm:flex-none"
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components to use error boundary behavior
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) => {
    return (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );
};

// Simplified error boundary for smaller components
export const SimpleErrorBoundary: React.FC<{
    children: ReactNode;
    fallback?: ReactNode;
}> = ({ children, fallback }) => (
    <ErrorBoundary
        fallback={fallback || (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">Something went wrong</span>
                </div>
            </div>
        )}
    >
        {children}
    </ErrorBoundary>
);