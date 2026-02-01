/**
 * API Service Layer
 * Centralized API client for all frontend applications
 * Handles authentication, error handling, and request/response transformations
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RequestConfig extends AxiosRequestConfig {
  retryCount?: number;
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;
  private retryLimit = 3;
  private retryDelay = 1000; // ms
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL?: string) {
    // In a fully decentralized system, we'd connect to blockchain/IPFS directly
    // For now, we'll check if we should operate in decentralized mode
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Initialize with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        // Add any default headers needed for decentralized operation
      },
    });
    
    // Add interceptors for decentralized authentication
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Only set up interceptors if we have a centralized API URL
    // In a fully decentralized system, these would be replaced with blockchain/IPFS calls
    if (this.baseURL) {
      // Request interceptor - add auth token
      this.client.interceptors.request.use(
        (config) => {
          const token = this.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor - handle errors and token refresh
      this.client.interceptors.response.use(
        (response) => response,
        async (error) => this.handleError(error)
      );
    }
  }

  /**
   * Get base URL from environment variables or window location
   */
  private getBaseURL(): string {
    if (typeof window === 'undefined') {
      // Server-side
      return process.env.API_URL_INTERNAL || 'http://localhost:3000/api';
    }
    // Client-side
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      `${window.location.protocol}//${window.location.host}/api`
    );
  }

  /**
   * Get stored access token
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('refreshToken');
    } catch {
      return null;
    }
  }

  /**
   * Set tokens in localStorage
   */
  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('tokenExpiresAt', (Date.now() + tokens.expiresIn * 1000).toString());
    } catch {
      console.error('Failed to store tokens');
    }
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
    } catch {
      console.error('Failed to clear tokens');
    }
  }

  /**
   * Process failed request queue after token refresh
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token || '');
      }
    });
    this.failedQueue = [];
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.isRefreshing = false;
      this.clearTokens();
      this.redirectToLogin();
      return false;
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      if (response.data.success && response.data.data.accessToken) {
        const tokens: AuthTokens = {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken || refreshToken,
          expiresIn: response.data.data.expiresIn || 3600,
        };
        this.setTokens(tokens);
        this.processQueue(null, tokens.accessToken);
        this.isRefreshing = false;
        return true;
      }
    } catch (error) {
      this.processQueue(error, null);
      this.clearTokens();
      this.redirectToLogin();
      this.isRefreshing = false;
      return false;
    }

    return false;
  }

  /**
   * Redirect to login on authentication failure
   */
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth')) {
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(currentPath);
      }
    }
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError(error: AxiosError<any>): Promise<never> {
    const config = error.config as RequestConfig;
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle 401 Unauthorized - try token refresh
    if (status === 401 && config) {
      if (!config.retryCount) {
        config.retryCount = 0;
      }
      config.retryCount++;

      if (config.retryCount <= 1) {
        // Only attempt refresh once
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.client(config);
        }
      }
    }

    // Handle 429 Too Many Requests - implement exponential backoff
    if (status === 429 && config) {
      if (!config.retryCount) {
        config.retryCount = 0;
      }
      config.retryCount++;

      if (config.retryCount <= this.retryLimit) {
        const delay = this.retryDelay * Math.pow(2, config.retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.client(config);
      }
    }

    // Handle 5xx errors - retry with exponential backoff
    if (status && status >= 500 && config) {
      if (!config.retryCount) {
        config.retryCount = 0;
      }
      config.retryCount++;

      if (config.retryCount <= this.retryLimit) {
        const delay = this.retryDelay * Math.pow(2, config.retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.client(config);
      }
    }

    // Build error response
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: data?.error || error.message || 'An error occurred',
      code: data?.code,
      statusCode: status,
      details: data?.details,
    };

    return Promise.reject(errorResponse);
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<any>(url, config);
      return response.data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<any>(url, data, config);
      return response.data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<any>(url, data, config);
      return response.data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<any>(url, data, config);
      return response.data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<any>(url, config);
      return response.data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set authorization tokens (for login)
   */
  setAuthTokens(tokens: AuthTokens): void {
    this.setTokens(tokens);
  }

  /**
   * Clear authorization (for logout)
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get current base URL
   */
  getApiBaseURL(): string {
    return this.baseURL;
  }

  // Decentralized methods

  /**
   * Get data from IPFS
   */
  async getFromIPFS(cid: string): Promise<any> {
    try {
      // In a real implementation, this would fetch from IPFS
      // For now, we'll simulate with a mock
      console.log(`Fetching data from IPFS: ${cid}`);
      // Implementation would use IPFS gateway or client
      return null;
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw error;
    }
  }

  /**
   * Store data on IPFS
   */
  async storeOnIPFS(data: any): Promise<string> {
    try {
      // In a real implementation, this would upload to IPFS
      // For now, we'll simulate with a mock
      console.log('Storing data on IPFS:', data);
      // Implementation would use IPFS client
      return 'QmMockCID1234567890';
    } catch (error) {
      console.error('Error storing on IPFS:', error);
      throw error;
    }
  }

  /**
   * Get data from blockchain via smart contract
   */
  async getFromBlockchain(contractAddress: string, method: string, params?: any[]): Promise<any> {
    try {
      // In a real implementation, this would call smart contracts
      // For now, we'll simulate with a mock
      console.log(`Getting data from blockchain: ${contractAddress}.${method}`, params);
      // Implementation would use web3 provider and contract calls
      return null;
    } catch (error) {
      console.error('Error getting from blockchain:', error);
      throw error;
    }
  }

  /**
   * Execute blockchain transaction
   */
  async executeBlockchainTx(contractAddress: string, method: string, params?: any[], value?: string): Promise<any> {
    try {
      // In a real implementation, this would execute blockchain transactions
      // For now, we'll simulate with a mock
      console.log(`Executing blockchain transaction: ${contractAddress}.${method}`, params, value);
      // Implementation would use web3 provider and contract calls
      return { txHash: '0xMockTxHash1234567890', status: 'pending' };
    } catch (error) {
      console.error('Error executing blockchain transaction:', error);
      throw error;
    }
  }

  /**
   * Check if running in decentralized mode
   */
  isDecentralizedMode(): boolean {
    return !this.baseURL;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
