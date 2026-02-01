import useSWR from 'swr';
import { api } from '@shared/utils/api';

export interface Order {
    id: string;
    restaurantName: string;
    status: string;
    createdAt: string;
    total: number;
    items: any[];
}

export function useOrders() {
    const { data, error, isLoading, mutate } = useSWR<{ orders: Order[] }>(
        '/orders',
        () => api.get<{ orders: Order[] }>('/orders'),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        orders: data?.orders || [],
        isLoading,
        isError: error,
        mutate,
    };
}
