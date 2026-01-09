import Cookies from 'js-cookie';

const getApiUrl = () => {
    if (typeof window === 'undefined') {
        // Server-side (SSR): prioritize internal Docker networking
        return process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    }

    const host = window.location.hostname;

    // If we're on the production domain (nilelink.app or any subdomain)
    if (host.endsWith('nilelink.app')) {
        // Use the centralized api subdomain
        return `https://api.nilelink.app/api`;
    }

    // Fallback for local development or other environments
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
};

const API_URL = getApiUrl();


interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requireAuth) {
        const token = Cookies.get('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Request failed', data);
    }

    return data.data as T;
}

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            requireAuth: false,
        }),

    signup: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
        apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
            requireAuth: false,
        }),

    logout: () =>
        apiRequest('/auth/logout', {
            method: 'POST',
        }),

    sendOtp: (email: string, purpose: string) =>
        apiRequest('/auth/otp/send', {
            method: 'POST',
            body: JSON.stringify({ email, purpose }),
            requireAuth: false,
        }),

    verifyOtp: (email: string, otp: string) =>
        apiRequest('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
            requireAuth: false,
        }),
};

// Restaurant API
export const restaurantApi = {
    list: () => apiRequest('/restaurants', { requireAuth: false }),

    getById: (id: string) => apiRequest(`/restaurants/${id}`, { requireAuth: false }),

    getInventory: (id: string) => apiRequest(`/restaurants/${id}/inventory`),
};

// Order API
export const orderApi = {
    list: (params?: { restaurantId?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest(`/orders${query ? `?${query}` : ''}`);
    },

    create: (data: {
        restaurantId: string;
        customerId?: string;
        items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
    }) =>
        apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateStatus: (id: string, status: string) =>
        apiRequest(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
};

// Settlement API
export const settlementApi = {
    list: (restaurantId: string) =>
        apiRequest(`/settlements?restaurantId=${restaurantId}`),

    request: (data: { restaurantId: string; start: string; end: string }) =>
        apiRequest('/settlements/request', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// Generic API object for direct requests
export const api = {
    get: <T = any>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T = any>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Loyalty API
export const loyaltyApi = {
    getProfile: () => apiRequest('/loyalty/profile'),
    getHistory: () => apiRequest('/loyalty/history'),
    redeem: (amount: number, rewardType: string) =>
        apiRequest('/loyalty/redeem', {
            method: 'POST',
            body: JSON.stringify({ amount, rewardType })
        })
};

// Supplier API
export const supplierApi = {
    getInventory: () => apiRequest('/suppliers/inventory'),
    restock: (data: any) =>
        apiRequest('/suppliers/restock', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    getCredit: () => apiRequest('/suppliers/credit'),
    getRevenue: () => apiRequest('/suppliers/nilelink-revenue')
};

// Delivery API
export const deliveryApi = {
    getAvailable: () => apiRequest('/deliveries/available'),
    claim: (id: string) => apiRequest(`/deliveries/${id}/accept`, { method: 'POST' }),
    updateStatus: (id: string, status: string) =>
        apiRequest(`/deliveries/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        }),
    getHistory: () => apiRequest('/deliveries/my-history')
};

export { ApiError };
