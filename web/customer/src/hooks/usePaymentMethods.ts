import useSWR from 'swr';

import { api } from '@shared/utils/api';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export function usePaymentMethods() {
  const { data, error, isLoading, mutate } = useSWR<{ paymentMethods: PaymentMethod[] }>(
    '/payment-methods',
    () => api.get<{ paymentMethods: PaymentMethod[] }>('/payment-methods'),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    paymentMethods: data?.paymentMethods || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function addPaymentMethod(data: {
  type: 'card' | 'wallet';
  cardToken?: string;
  walletAddress?: string;
  brand?: string;
  last4?: string;
}): Promise<PaymentMethod> {
  const response = await api.post<{ paymentMethod: PaymentMethod }>('/payment-methods', data);
  return response.paymentMethod;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await api.delete(`/payment-methods/${id}`);
}

export async function setDefaultPaymentMethod(id: string): Promise<void> {
  await api.patch(`/payment-methods/${id}/set-default`);
}
