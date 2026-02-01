import { useState } from 'react';
import { ApiError } from '@shared/utils/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed', data);
  }

  return data.data as T;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

export function usePromoCode() {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async (code: string, orderAmount: number): Promise<PromoCode | null> => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return null;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await apiRequest<{ promoCode: PromoCode }>('/promo-codes/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderAmount }),
      });

      return response.promoCode;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid promo code');
      } else {
        setError('Failed to validate promo code');
      }
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validatePromoCode,
    isValidating,
    error,
    clearError: () => setError(null),
  };
}
