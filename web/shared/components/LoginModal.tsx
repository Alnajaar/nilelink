/**
 * LoginModal.tsx
 * Shared Wallet Login Component
 * 
 * Used by all 5 apps (POS, Customer, Supplier, Admin, Driver)
 * Provides consistent UI for SIWE authentication across all platforms
 */

'use client';

import React, { useState } from 'react';
import { useWeb3Auth } from '@shared/hooks/useWeb3Auth';
import { useContractRole, UserRole } from '@shared/hooks/useContractRole';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole?: UserRole | UserRole[];
  onLoginSuccess?: (address: string, role: UserRole | null) => void;
  title?: string;
  description?: string;
  appName?: string;
}

export function LoginModal({
  isOpen,
  onClose,
  requiredRole,
  onLoginSuccess,
  title = 'Connect Wallet',
  description = 'Sign in with your Ethereum wallet',
  appName = 'NileLink',
}: LoginModalProps) {
  const { login, isLoading: isAuthLoading, error: authError } = useWeb3Auth();
  const [tempAddress, setTempAddress] = useState<string | null>(null);
  const { role, isLoading: isRoleLoading, hasRole } = useContractRole(tempAddress);

  const isLoading = isAuthLoading || isRoleLoading;
  const error = authError;

  const handleLogin = async () => {
    try {
      const address = await login();
      if (address) {
        setTempAddress(address);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleConfirm = () => {
    if (!tempAddress || !role) {
      return;
    }

    // Check role requirement if specified
    if (requiredRole && !hasRole(requiredRole)) {
      return;
    }

    onLoginSuccess?.(tempAddress, role);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const roleCheckPassed = !requiredRole || hasRole(requiredRole);
  const showRoleError = tempAddress && isRoleLoading === false && !roleCheckPassed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!tempAddress ? (
            // Step 1: Connect Wallet
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  You'll be asked to sign a message to verify your identity. No gas fees required.
                </p>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Connecting...
                  </span>
                ) : (
                  'Connect with MetaMask'
                )}
              </button>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900 font-medium">Connection Error</p>
                  <p className="text-sm text-red-700 mt-1">{authError.message}</p>
                </div>
              )}
            </div>
          ) : (
            // Step 2: Verify Role
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900">✓ Wallet Connected</p>
                <p className="text-xs text-green-700 mt-1 font-mono">{tempAddress}</p>
              </div>

              {isRoleLoading ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900 flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Verifying your role...
                  </p>
                </div>
              ) : (
                <>
                  {role ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900">Your Role</p>
                      <p className="text-lg font-semibold text-blue-700 mt-1">{role}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">No role found on chain</p>
                    </div>
                  )}

                  {showRoleError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-900">❌ Access Denied</p>
                      <p className="text-sm text-red-700 mt-1">
                        Your role is {role || 'not verified'}. 
                        {requiredRole && (
                          <span>
                            {' '}
                            This app requires:{' '}
                            {Array.isArray(requiredRole)
                              ? requiredRole.join(' or ')
                              : requiredRole}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setTempAddress(null)}
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !roleCheckPassed}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3 flex justify-between items-center">
          <p className="text-xs text-gray-600">
            Powered by {appName}
          </p>
          {tempAddress === null && (
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Variant: Full-page login screen
export function LoginPage({
  requiredRole,
  onLoginSuccess,
  appName = 'NileLink',
}: Omit<LoginModalProps, 'isOpen' | 'onClose'>) {
  const { login, isLoading: isAuthLoading, error: authError } = useWeb3Auth();
  const [address, setAddress] = useState<string | null>(null);
  const { role, isLoading: isRoleLoading } = useContractRole(address);

  const isLoading = isAuthLoading || isRoleLoading;

  const handleLogin = async () => {
    try {
      const addr = await login();
      if (addr) {
        setAddress(addr);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleConfirm = () => {
    if (address && role) {
      onLoginSuccess?.(address, role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-center rounded-t-lg">
          <h1 className="text-3xl font-bold text-white">{appName}</h1>
          <p className="text-blue-100 mt-2">Connect your wallet to continue</p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {!address ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  🔐 Sign in with your Ethereum wallet. No password needed.
                </p>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span>🦊</span>
                    Connect MetaMask
                  </>
                )}
              </button>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900 font-medium">Error</p>
                  <p className="text-xs text-red-700 mt-1">{authError.message}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-gray-600 text-center">
                  Don't have a wallet?{' '}
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Install MetaMask
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-green-900">✓ Connected</p>
                <p className="text-xs text-green-700 mt-2 font-mono break-all">{address}</p>
              </div>

              {isRoleLoading ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-900">
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Verifying role...
                  </p>
                </div>
              ) : role ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600">Your Role</p>
                    <p className="text-2xl font-bold text-blue-700 mt-2">{role}</p>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Continue as {role}
                  </button>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-red-900">⚠️ No role found</p>
                  <p className="text-xs text-red-700 mt-1">
                    This wallet doesn't have access to {appName}
                  </p>
                </div>
              )}

              <button
                onClick={() => setAddress(null)}
                className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                Use different wallet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
