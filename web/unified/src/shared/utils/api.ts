import Cookies from 'js-cookie';

const getApiUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    }

    const host = window.location.hostname;

    // If we're on the production domain (nilelink.app or any subdomain)
    if (host.endsWith('nilelink.app')) {
        // Use the centralized api subdomain
        return `https://api.nilelink.app/api`;
    }

    // Fallback for local development or other environments
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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

// Analytics API
export const analyticsApi = {
    getDashboard: () => apiRequest('/analytics/dashboard'),
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

export { ApiError };
