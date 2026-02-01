

const getApiUrl = () => {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    // NileLink uses local Next.js API bridges for tracking 
    return '/api';
};

const API_URL = getApiUrl(); // Will always be empty string for decentralized operation


interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    // Check if running in offline/demo mode
    const isOfflineMode = typeof window !== 'undefined' && !window.navigator.onLine;

    // Only block and return mock data if explicitly in DEMO_MODE 
    // or if it's a cross-origin request without an API_URL.
    // Local /api requests should be allowed.
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        console.warn(`API call to ${endpoint} blocked - running in demo mode`);
        return getMockData<T>(endpoint);
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requireAuth) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nilelink_auth_token') : null;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        const text = await response.text();
        let data: any;

        try {
            data = JSON.parse(text);
        } catch (e) {
            if (!response.ok) {
                throw new ApiError(response.status, `Server Error (${response.status}): ${text.slice(0, 100)}`);
            }
            throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`);
        }

        if (!response.ok) {
            throw new ApiError(
                response.status,
                data.error || data.message || `API Error ${response.status}`,
                data
            );
        }

        return (data.data || data) as T;
    } catch (error: any) {
        // Universal catch-all for network-level failures (CORS, DNS, Offline, Aborted)
        const isNetworkError =
            (error instanceof TypeError && (
                error.message.includes('fetch') ||
                error.message.includes('Network') ||
                error.message.includes('network')
            )) ||
            error.name === 'TypeError' ||
            error.message === 'Failed to fetch';

        if (isNetworkError) {
            console.warn(`[NileLink API] Network/CORS error for ${endpoint}. Fallback to mock:`, error.message);
            return getMockData<T>(endpoint);
        }

        console.error(`[NileLink API] Unhandled request error for ${endpoint}:`, error);
        throw error;
    }
}

// Mock data function for offline/demo mode
function getMockData<T>(endpoint: string): T {
    // Return appropriate mock data based on endpoint
    if (endpoint.includes('/restaurants')) {
        return {
            restaurants: [],
            status: 'offline'
        } as T;
    }
    if (endpoint.includes('/orders')) {
        return {
            orders: [],
            status: 'offline'
        } as T;
    }
    if (endpoint.includes('/system/stats')) {
        return {
            revenue: 0,
            tps: 0,
            nodes: 1,
            merchants: 0,
            users: 0,
            orders: 0,
            status: 'offline'
        } as T;
    }
    if (endpoint.includes('/system/health')) {
        return {
            status: 'healthy' as const,
            components: [],
            recentPatches: [],
            predictions: []
        } as T;
    }
    // Default empty response
    return {} as T;
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

    getWalletChallenge: (address: string) =>
        apiRequest('/auth/wallet/challenge', {
            method: 'POST',
            body: JSON.stringify({ address }),
            requireAuth: false,
        }),

    verifyWalletSignature: (data: { address: string; signature: string; message: string; challengeId?: string }) =>
        apiRequest('/auth/wallet/verify', {
            method: 'POST',
            body: JSON.stringify(data),
            requireAuth: false,
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

    refreshToken: (refreshToken: string) =>
        apiRequest('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
            requireAuth: false,
        }),

    getMe: () =>
        apiRequest('/auth/me', {
            method: 'GET',
            requireAuth: true,
        }),

    forgotPassword: (email: string) =>
        apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
            requireAuth: false,
        }),

    resetPassword: (token: string, password: string, confirmPassword: string) =>
        apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password, confirmPassword }),
            requireAuth: false,
        }),

    verifyEmail: (token: string) =>
        apiRequest('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
            requireAuth: false,
        }),

    resendVerification: (email: string) =>
        apiRequest('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
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

    getById: (id: string) => {
        return apiRequest(`/orders/${id}`);
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

export const loyaltyApi = {
    getProfile: () => apiRequest('/loyalty/profile'),
    getHistory: () => apiRequest('/loyalty/history'),
    redeem: (amount: number, rewardType: string) =>
        apiRequest('/loyalty/redeem', {
            method: 'POST',
            body: JSON.stringify({ amount, rewardType })
        })
};

export const supplierApi = {
    getInventory: () => apiRequest('/suppliers/inventory'),
    restock: (data: any) =>
        apiRequest('/suppliers/restock', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    getCredit: () => apiRequest('/suppliers/credit'),
    getRevenue: () => apiRequest('/suppliers/nilelink-revenue'),
    listPaymentMethods: () => apiRequest<any[]>('/suppliers/payment-methods'),
    addPaymentMethod: (data: any) =>
        apiRequest('/suppliers/payment-methods', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    setDefaultPaymentMethod: (id: string) =>
        apiRequest(`/suppliers/payment-methods/${id}/default`, {
            method: 'POST'
        }),
    deletePaymentMethod: (id: string) =>
        apiRequest(`/suppliers/payment-methods/${id}`, {
            method: 'DELETE'
        })
};

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

export const cryptoApi = {
    processPayment: (data: { orderId: string; amount: number; walletAddress: string; paymentMethod: string }) =>
        apiRequest('/crypto/payments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getWalletInfo: (address: string) => apiRequest(`/crypto/wallet/${address}`),
    verifyPayment: (data: { orderId: string; txHash: string }) =>
        apiRequest('/crypto/verify-payment', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getSupportedTokens: () => apiRequest('/crypto/supported-tokens', { requireAuth: false }),
    getExchangeRates: () => apiRequest('/crypto/exchange-rates', { requireAuth: false }),
};

// System API
export const systemApi = {
    getStats: () => apiRequest<{
        revenue: number;
        tps: number;
        nodes: number;
        merchants: number;
        users: number;
        orders: number;
        status: string;
    }>('/system/stats', { requireAuth: false }),
    getHealth: () => apiRequest<{
        status: 'healthy' | 'degraded' | 'critical';
        components: any[];
        recentPatches: any[];
        predictions: any[];
    }>('/system/health', { requireAuth: false }),
    getConfig: () => apiRequest('/system/config', { requireAuth: false }),
};

// Generic API function for simple requests
export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint),
    post: <T>(endpoint: string, data?: any) => apiRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
    }),
    put: <T>(endpoint: string, data?: any) => apiRequest<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
    }),
    patch: <T>(endpoint: string, data?: any) => apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined
    }),
    delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' })
};

export { ApiError };

// All other exports are already declared above with 'export const'
