import { authApi } from '../utils/api';
import Cookies from 'js-cookie';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    walletAddress?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    lastLogin?: Date;
}

export interface LoginResponse {
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
    requiresEmailVerification?: boolean;
    remainingAttempts?: number;
    lockExpiresAt?: string;
}

export interface RegisterResponse {
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
    requiresEmailVerification?: boolean;
}

export interface WalletChallengeResponse {
    success: boolean;
    message?: string;
    challengeId?: string;
    timestamp?: number;
    error?: string;
}

export interface WalletAuthResponse {
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
}

export interface OTPResponse {
    success: boolean;
    message?: string;
    expiresAt?: string;
    error?: string;
}

export interface PasswordResetResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export class AuthService {
    private static instance: AuthService;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    private constructor() {
        this.initializeFromStorage();
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private initializeFromStorage(): void {
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('nilelink_auth_token') || Cookies.get('nilelink_access_token') || null;
            this.refreshToken = localStorage.getItem('nilelink_refresh_token') || Cookies.get('nilelink_refresh_token') || null;

            // Sync cookie back to localStorage if found
            if (!localStorage.getItem('nilelink_auth_token') && this.accessToken) {
                localStorage.setItem('nilelink_auth_token', this.accessToken);
            }
        }
    }

    private saveTokens(accessToken: string, refreshToken: string): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if (typeof window !== 'undefined') {
            localStorage.setItem('nilelink_auth_token', accessToken);
            localStorage.setItem('nilelink_refresh_token', refreshToken);

            // Set shared cookies for cross-domain SSO
            const cookieOptions = {
                expires: 7,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const
            };

            Cookies.set('nilelink_access_token', accessToken, cookieOptions);
            Cookies.set('nilelink_refresh_token', refreshToken, cookieOptions);
        }
    }

    private clearTokens(): void {
        this.accessToken = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('nilelink_auth_token');
            localStorage.removeItem('nilelink_refresh_token');
            localStorage.removeItem('nilelink_current_user');

            Cookies.remove('nilelink_access_token', { path: '/' });
            Cookies.remove('nilelink_refresh_token', { path: '/' });
        }
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response: any = await authApi.login(email, password);

            if (response.success) {
                const { user, accessToken, refreshToken, requiresEmailVerification } = response.data;

                if (accessToken && refreshToken) {
                    this.saveTokens(accessToken, refreshToken);
                }

                // Store user data
                if (typeof window !== 'undefined') {
                    localStorage.setItem('nilelink_current_user', JSON.stringify(user));
                }

                return {
                    success: true,
                    user,
                    tokens: { accessToken, refreshToken },
                    requiresEmailVerification
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Login failed',
                    remainingAttempts: response.remainingAttempts,
                    lockExpiresAt: response.lockExpiresAt
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: string;
        tenantId?: string;
        subdomain?: string;
    }): Promise<RegisterResponse> {
        try {
            const response: any = await authApi.signup(userData);

            if (response.success) {
                const { user, accessToken, refreshToken, requiresEmailVerification } = response.data;

                if (accessToken && refreshToken) {
                    this.saveTokens(accessToken, refreshToken);
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('nilelink_current_user', JSON.stringify(user));
                }

                return {
                    success: true,
                    user,
                    tokens: { accessToken, refreshToken },
                    requiresEmailVerification
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Registration failed'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
    }

    async logout(): Promise<void> {
        try {
            await authApi.logout();
        } catch (error) {
            // Continue with local logout even if API call fails
            console.warn('Logout API call failed:', error);
        } finally {
            this.clearTokens();
        }
    }

    async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await authApi.refreshToken(this.refreshToken) as any;
            if (response.success && response.data?.accessToken) {
                this.accessToken = response.data.accessToken;
                if (typeof window !== 'undefined' && this.accessToken) {
                    localStorage.setItem('nilelink_auth_token', this.accessToken);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response: any = await authApi.getMe();
            return response.success ? response.data.user : null;
        } catch (error) {
            console.error('Get current user failed:', error);
            return null;
        }
    }

    // Wallet Authentication Methods
    async getWalletChallenge(address: string): Promise<WalletChallengeResponse> {
        try {
            const response: any = await authApi.getWalletChallenge(address);

            return {
                success: true,
                message: response.message,
                challengeId: response.challengeId,
                timestamp: response.timestamp
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get challenge'
            };
        }
    }

    async getSiweNonce(): Promise<string> {
        try {
            const response: any = await authApi.getSiweNonce();
            return response.nonce;
        } catch (error) {
            // Fallback for demo/offline: Return a random nonce
            return Math.random().toString(36).substring(2);
        }
    }

    async verifyWalletSignature(address: string, signature: string, message: string, challengeId?: string): Promise<WalletAuthResponse> {
        try {
            const response: any = await authApi.verifyWalletSignature({ address, signature, message, challengeId });

            const { user, accessToken, refreshToken } = response;

            if (accessToken && refreshToken) {
                this.saveTokens(accessToken, refreshToken);
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('nilelink_current_user', JSON.stringify(user));
            }

            return {
                success: true,
                user,
                tokens: { accessToken, refreshToken }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Wallet verification failed'
            };
        }
    }

    // OTP Methods
    async sendOTP(email: string, purpose: string = 'login'): Promise<OTPResponse> {
        try {
            const response: any = await authApi.sendOtp(email, purpose);

            if (response.success) {
                return {
                    success: true,
                    message: response.message,
                    expiresAt: response.data.expiresAt
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Failed to send OTP'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to send OTP'
            };
        }
    }

    async verifyOTP(email: string, otp: string): Promise<LoginResponse> {
        return this.loginWithPhone(email, otp);
    }

    async loginWithPhone(emailOrPhone: string, otp: string): Promise<LoginResponse> {
        try {
            const response: any = await authApi.verifyOtp(emailOrPhone, otp);

            if (response.success) {
                const { user, accessToken, refreshToken } = response.data;

                if (accessToken && refreshToken) {
                    this.saveTokens(accessToken, refreshToken);
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('nilelink_current_user', JSON.stringify(user));
                }

                return {
                    success: true,
                    user,
                    tokens: { accessToken, refreshToken }
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'OTP verification failed'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'OTP verification failed'
            };
        }
    }

    // Password Reset Methods
    async forgotPassword(email: string): Promise<PasswordResetResponse> {
        try {
            const response: any = await authApi.forgotPassword(email);
            return {
                success: response.success,
                message: response.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to request password reset'
            };
        }
    }

    async resetPassword(token: string, password: string, confirmPassword: string): Promise<PasswordResetResponse> {
        try {
            const response: any = await authApi.resetPassword(token, password, confirmPassword);
            return {
                success: response.success,
                message: response.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to reset password'
            };
        }
    }

    // Email Verification Methods
    async verifyEmail(token: string): Promise<{ success: boolean; message: string; email?: string }> {
        try {
            const response: any = await authApi.verifyEmail(token);
            return {
                success: response.success,
                message: response.message,
                email: response.data?.email
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Email verification failed'
            };
        }
    }

    async resendVerification(email: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
        try {
            const response: any = await authApi.resendVerification(email);
            return {
                success: response.success,
                message: response.message,
                expiresAt: response.data?.expiresAt
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to resend verification'
            };
        }
    }

    // Validation helper
    async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
        try {
            const response = await fetch('/api/auth/validate-reset-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    valid: data.success,
                    email: data.data?.email
                };
            }
            return { valid: false };
        } catch (error) {
            console.error('Token validation failed:', error);
            return { valid: false };
        }
    }
}

export const authService = AuthService.getInstance();