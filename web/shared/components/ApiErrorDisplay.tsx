/**
 * API Error Display Component
 * Displays API errors with helpful context and retry functionality
 */

import React from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, Info } from 'lucide-react';
import { ApiErrorResponse } from '@shared/services/api';

interface ApiErrorDisplayProps {
  error: ApiErrorResponse | null;
  onRetry?: () => void;
  compact?: boolean;
  showDetails?: boolean;
}

export function ApiErrorDisplay({
  error,
  onRetry,
  compact = false,
  showDetails = false,
}: ApiErrorDisplayProps) {
  const [expanded, setExpanded] = React.useState(showDetails);

  if (!error) return null;

  const getErrorColor = (statusCode?: number) => {
    if (!statusCode) return 'bg-red-500/10 border-red-500/30';
    if (statusCode === 401) return 'bg-yellow-500/10 border-yellow-500/30';
    if (statusCode === 403) return 'bg-orange-500/10 border-orange-500/30';
    if (statusCode === 404) return 'bg-blue-500/10 border-blue-500/30';
    if (statusCode === 429) return 'bg-purple-500/10 border-purple-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getErrorTextColor = (statusCode?: number) => {
    if (!statusCode) return 'text-red-400';
    if (statusCode === 401) return 'text-yellow-400';
    if (statusCode === 403) return 'text-orange-400';
    if (statusCode === 404) return 'text-blue-400';
    if (statusCode === 429) return 'text-purple-400';
    return 'text-red-400';
  };

  const getErrorIcon = (statusCode?: number) => {
    if (!statusCode) return '⚠️';
    if (statusCode === 401) return '🔐';
    if (statusCode === 403) return '🚫';
    if (statusCode === 404) return '🔍';
    if (statusCode === 429) return '⏱️';
    if (statusCode >= 500) return '💥';
    return '⚠️';
  };

  if (compact) {
    return (
      <div
        className={`p-3 border rounded text-sm flex items-center gap-2 ${getErrorColor(
          error.statusCode
        )} ${getErrorTextColor(error.statusCode)}`}
      >
        <span className="text-lg flex-shrink-0">{getErrorIcon(error.statusCode)}</span>
        <span className="flex-grow">{error.error}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded"
            title="Retry"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-4 border rounded-lg ${getErrorColor(
        error.statusCode
      )} ${getErrorTextColor(error.statusCode)}`}
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-1">{getErrorIcon(error.statusCode)}</span>
        <div className="flex-grow">
          <h3 className="font-semibold text-base">
            {error.code ? `Error ${error.code}` : 'Error'}
          </h3>
          <p className="text-sm mt-1">{error.error}</p>

          {/* Status code and timestamp */}
          {error.statusCode && (
            <p className="text-xs opacity-75 mt-2">
              HTTP {error.statusCode}
            </p>
          )}

          {/* Expandable error details */}
          {error.details && Object.keys(error.details).length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-xs font-medium hover:opacity-75 transition"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
                {expanded ? 'Hide' : 'Show'} Details
              </button>

              {expanded && (
                <pre className="mt-2 p-3 bg-black/20 rounded text-xs overflow-auto max-h-48 font-mono">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded font-medium text-sm transition"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        )}
      </div>

      {/* Contextual help messages */}
      {error.statusCode === 401 && (
        <div className="mt-4 p-3 bg-black/20 rounded text-xs flex gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Session expired</p>
            <p>Please log in again to continue.</p>
          </div>
        </div>
      )}

      {error.statusCode === 403 && (
        <div className="mt-4 p-3 bg-black/20 rounded text-xs flex gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Access denied</p>
            <p>You don't have permission to access this resource.</p>
          </div>
        </div>
      )}

      {error.statusCode === 404 && (
        <div className="mt-4 p-3 bg-black/20 rounded text-xs flex gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Not found</p>
            <p>The requested resource doesn't exist.</p>
          </div>
        </div>
      )}

      {error.statusCode === 429 && (
        <div className="mt-4 p-3 bg-black/20 rounded text-xs flex gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Rate limited</p>
            <p>Too many requests. Please wait before trying again.</p>
          </div>
        </div>
      )}

      {error.statusCode && error.statusCode >= 500 && (
        <div className="mt-4 p-3 bg-black/20 rounded text-xs flex gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Server error</p>
            <p>Something went wrong on the server. We're working on it.</p>
          </div>
        </div>
      )}

      {!error.statusCode && (
        <div className="mt-4 p-3 bg-black/20 rounded text-xs flex gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Network error</p>
            <p>Check your connection and try again.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Loading Skeleton Component
// ============================================================================

interface LoadingSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function LoadingSkeleton({
  lines = 3,
  showAvatar = false,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-full" />
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      )}

      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-700 rounded ${i === lines - 1 ? 'w-5/6' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && <div className="mb-4 text-slate-400 text-4xl">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-6 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-white font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default ApiErrorDisplay;
