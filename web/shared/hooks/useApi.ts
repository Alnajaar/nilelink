/**
 * Custom React Hooks for API Integration
 * Provides reusable hooks for data fetching, error handling, and loading states
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import apiService, { ApiResponse, ApiErrorResponse } from '@shared/services/api';

// ============================================================================
// useApiCall - Generic hook for any API call
// ============================================================================

export interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiErrorResponse) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiCallReturn<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  execute: (params?: any) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options?: UseApiCallOptions
): UseApiCallReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const retriesRef = useRef(0);

  const execute = useCallback(
    async (params?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(params);

        if (response.success) {
          setData(response.data);
          options?.onSuccess?.(response.data);
          retriesRef.current = 0;
          return response.data;
        } else {
          const errorData = response as ApiErrorResponse;
          setError(errorData);
          options?.onError?.(errorData);
          return null;
        }
      } catch (err) {
        const errorData = err as ApiErrorResponse;
        setError(errorData);
        options?.onError?.(errorData);

        // Retry logic
        const retryLimit = options?.retryCount ?? 3;
        if (retriesRef.current < retryLimit) {
          retriesRef.current++;
          const delay = (options?.retryDelay ?? 1000) * retriesRef.current;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return execute(params);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    retriesRef.current = 0;
  }, []);

  return { data, loading, error, execute, reset };
}

// ============================================================================
// useApiQuery - Hook for GET requests with automatic loading
// ============================================================================

export interface UseApiQueryOptions extends UseApiCallOptions {
  enabled?: boolean;
  initialData?: any;
}

export interface UseApiQueryReturn<T = any> extends UseApiCallReturn<T> {
  refetch: () => Promise<T | null>;
}

export function useApiQuery<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  params?: any,
  options?: UseApiQueryOptions
): UseApiQueryReturn<T> {
  const [data, setData] = useState<T | null>(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const hasExecutedRef = useRef(false);

  const execute = useCallback(
    async (newParams?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(newParams ?? params);

        if (response.success) {
          setData(response.data);
          options?.onSuccess?.(response.data);
          return response.data;
        } else {
          const errorData = response as ApiErrorResponse;
          setError(errorData);
          options?.onError?.(errorData);
          return null;
        }
      } catch (err) {
        const errorData = err as ApiErrorResponse;
        setError(errorData);
        options?.onError?.(errorData);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, params, options]
  );

  const refetch = useCallback(() => execute(), [execute]);

  const reset = useCallback(() => {
    setData(options?.initialData || null);
    setLoading(true);
    setError(null);
  }, [options?.initialData]);

  // Auto-execute on mount
  useEffect(() => {
    if (options?.enabled !== false && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      execute();
    }
  }, [execute, options?.enabled]);

  return { data, loading, error, execute, reset, refetch };
}

// ============================================================================
// useApiMutation - Hook for POST/PUT/PATCH/DELETE requests
// ============================================================================

export interface UseApiMutationOptions extends UseApiCallOptions {
  showSuccessMessage?: boolean;
  successMessage?: string;
}

export interface UseApiMutationReturn<T = any> extends UseApiCallReturn<T> {
  mutate: (params?: any) => Promise<T | null>;
}

export function useApiMutation<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options?: UseApiMutationOptions
): UseApiMutationReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  const mutate = useCallback(
    async (params?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(params);

        if (response.success) {
          setData(response.data);
          if (options?.showSuccessMessage) {
            // You might want to integrate with a toast notification library here
            console.log(options?.successMessage || 'Success!');
          }
          options?.onSuccess?.(response.data);
          return response.data;
        } else {
          const errorData = response as ApiErrorResponse;
          setError(errorData);
          options?.onError?.(errorData);
          return null;
        }
      } catch (err) {
        const errorData = err as ApiErrorResponse;
        setError(errorData);
        options?.onError?.(errorData);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute: mutate, reset, mutate };
}

// ============================================================================
// useApiPagination - Hook for paginated API calls
// ============================================================================

export interface UseApiPaginationOptions extends UseApiCallOptions {
  pageSize?: number;
}

export interface UseApiPaginationReturn<T = any> {
  data: T[];
  loading: boolean;
  error: ApiErrorResponse | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  reset: () => void;
}

export function useApiPagination<T = any>(
  apiFunction: (page: number, pageSize: number) => Promise<ApiResponse<{
    data: T[];
    total: number;
  }>>,
  pageSize: number = 10,
  options?: UseApiPaginationOptions
): UseApiPaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(page, pageSize);

        if (response.success) {
          setData(response.data.data);
          setTotal(response.data.total);
          setCurrentPage(page);
          options?.onSuccess?.(response.data.data);
        } else {
          const errorData = response as ApiErrorResponse;
          setError(errorData);
          options?.onError?.(errorData);
        }
      } catch (err) {
        const errorData = err as ApiErrorResponse;
        setError(errorData);
        options?.onError?.(errorData);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, pageSize, options]
  );

  const goToPage = useCallback(
    async (page: number) => {
      if (page >= 1 && page <= totalPages) {
        await fetchPage(page);
      }
    },
    [fetchPage, totalPages]
  );

  const nextPage = useCallback(async () => {
    if (hasNextPage) {
      await fetchPage(currentPage + 1);
    }
  }, [fetchPage, hasNextPage, currentPage]);

  const previousPage = useCallback(async () => {
    if (hasPreviousPage) {
      await fetchPage(currentPage - 1);
    }
  }, [fetchPage, hasPreviousPage, currentPage]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setTotal(0);
    fetchPage(1);
  }, [fetchPage]);

  // Initial fetch
  useEffect(() => {
    fetchPage(1);
  }, []);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    reset,
  };
}

export default {
  useApiCall,
  useApiQuery,
  useApiMutation,
  useApiPagination,
};
