/**
 * LoginPage.tsx
 * Centralized Login Page Component
 * Supports email/password and phone authentication
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, User, Lock, Eye, EyeOff, ArrowRight, Shield, Zap, Fingerprint, Cpu } from 'lucide-react';
import { Button } from './Button';
import { useFirebaseAuth } from '../providers/FirebaseAuthProvider';
import { DeepSpaceBackground } from './DeepSpaceBackground';
import { cn } from '../lib/utils';

interface LoginPageProps {
  requiredRole?: string | string[];
  appName?: string;
  roleMessage?: string | null;
  onLoginSuccess?: () => void;
  theme?: 'light' | 'dark';
  showRegister?: boolean;
  initialEmail?: string;
  initialPassword?: string;
}

export function LoginPage({
  requiredRole,
  appName = 'NileLink',
  roleMessage,
  onLoginSuccess,
  theme = 'light',
  showRegister = true,
  initialEmail = '',
  initialPassword = ''
}: LoginPageProps) {
  const { loginWithEmail, registerWithEmail, loginWithPhone, verifyPhoneCode, logout, user, isLoading, error } = useFirebaseAuth();

  const [currentMode, setCurrentMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState(initialEmail && theme === 'dark' ? '' : initialEmail);
  const [password, setPassword] = useState(initialPassword && theme === 'dark' ? '' : initialPassword);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  const [isLocked, setIsLocked] = useState(initialEmail && theme === 'dark' ? true : false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'number' | 'code'>('number');

  const handleEmailSubmit = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    e?.preventDefault();
    setIsProcessing(true);

    try {
      if (currentMode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await registerWithEmail(email, password, firstName, lastName);
      } else {
        await loginWithEmail(customEmail || email, customPassword || password);
      }

      onLoginSuccess?.();
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (phoneStep === 'number') {
        const result = await loginWithPhone(phoneNumber);
        setConfirmationResult(result);
        setPhoneStep('code');
      } else {
        await verifyPhoneCode(confirmationResult, phoneCode);
        onLoginSuccess?.();
      }
    } catch (err) {
      console.error('Phone authentication error:', err);
    } finally {
      setIsProcessing(false);
    }
  };



  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      isDark ? "bg-[#02050a] text-white" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    )}>
      {isDark && <DeepSpaceBackground />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className={cn(
              "mx-auto w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6",
              isDark ? "bg-blue-600/20 border border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.2)]" : "bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl"
            )}
          >
            {isDark ? <Cpu className="w-10 h-10 text-blue-400" /> : <Zap className="w-10 h-10 text-white" />}
          </motion.div>

          <h1 className={cn(
            "text-4xl font-black mb-1 tracking-tighter uppercase italic",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {appName.includes(' ') ? (
              <>
                {appName.split(' ')[0]} <span className="text-blue-500">{appName.split(' ').slice(1).join(' ')}</span>
              </>
            ) : appName}
          </h1>
          <p className={cn(
            "font-black uppercase tracking-[0.3em] text-[9px] opacity-70",
            isDark ? "text-blue-400" : "text-gray-600"
          )}>
            {currentMode === 'login'
              ? 'Institutional Access Portal'
              : 'Initialize New Admin Node'}
          </p>
        </div>

        {roleMessage && (
          <div className={cn(
            "mb-6 p-5 rounded-[1.5rem] text-sm border",
            isDark ? "bg-red-500/10 border-red-500/20 text-red-100" : "bg-yellow-50 border-yellow-200 text-yellow-800"
          )}>
            <div className="flex items-start gap-4">
              <Shield className={cn("w-6 h-6 mt-0.5 flex-shrink-0", isDark ? "text-red-500" : "text-yellow-600")} />
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] mb-1">Access Restricted</p>
                <p className="font-medium">{roleMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "rounded-[3rem] p-10 transition-all overflow-hidden",
          isDark ? "bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)]" : "bg-white shadow-2xl border border-gray-100"
        )}>
          {/* Mode Toggle */}
          {showRegister && (
            <div className={cn(
              "flex rounded-[1.25rem] p-1 mb-8",
              isDark ? "bg-white/5" : "bg-gray-100"
            )}>
              <button
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  currentMode === 'login'
                    ? (isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white shadow-sm text-blue-600')
                    : 'text-gray-500 hover:text-white'
                )}
                onClick={() => setCurrentMode('login')}
              >
                Sign In
              </button>
              <button
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  currentMode === 'register'
                    ? (isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white shadow-sm text-blue-600')
                    : 'text-gray-500 hover:text-white'
                )}
                onClick={() => setCurrentMode('register')}
              >
                Register
              </button>
            </div>
          )}

          {/* Auth Method Toggle */}
          <div className={cn(
            "flex rounded-[1.25rem] p-1 mb-10",
            isDark ? "bg-white/5" : "bg-gray-100"
          )}>

            <button
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                authMethod === 'email'
                  ? (isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white shadow-sm text-blue-600')
                  : 'text-gray-500 hover:text-white'
              )}
              onClick={() => setAuthMethod('email')}
            >
              Credentials
            </button>
            <button
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                authMethod === 'phone'
                  ? (isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white shadow-sm text-blue-600')
                  : 'text-gray-500 hover:text-white'
              )}
              onClick={() => setAuthMethod('phone')}
            >
              Secure 2FA
            </button>
          </div>

          {error && (
            <div className={cn(
              "mb-8 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
              isDark ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-red-50 border-red-200 text-red-700"
            )}>
              {error.includes('auth/invalid-credential')
                ? 'Invalid Administrative PIN or Credentials'
                : error}
            </div>
          )}



          {/* Email/Password Form */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-8">
              {currentMode === 'register' && (
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={cn("block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1", isDark ? "text-gray-500" : "text-gray-700")}>First Name</label>
                    <div className="relative group">
                      <User className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className={cn(
                          "w-full pl-14 pr-5 py-5 rounded-[1.5rem] transition-all outline-none text-sm font-medium",
                          isDark ? "bg-white/5 border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        )}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={cn("block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1", isDark ? "text-gray-500" : "text-gray-700")}>Last Name</label>
                    <div className="relative group">
                      <User className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className={cn(
                          "w-full pl-14 pr-5 py-5 rounded-[1.5rem] transition-all outline-none text-sm font-medium",
                          isDark ? "bg-white/5 border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        )}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className={cn("block text-[10px] font-black uppercase tracking-[0.3em] mb-3 ml-1", isDark ? "text-blue-400/60" : "text-gray-700")}>Account Identity</label>
                <div className="relative group">
                  <Mail className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter authorized e-mail"
                    className={cn(
                      "w-full pl-14 pr-5 py-5 rounded-[1.5rem] transition-all outline-none text-sm font-medium",
                      isDark ? "bg-white/[0.03] border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50 backdrop-blur-xl" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    )}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={cn("block text-[10px] font-black uppercase tracking-[0.3em] mb-3 ml-1", isDark ? "text-blue-400/60" : "text-gray-700")}>Secure Password</label>
                <div className="relative group">
                  <Lock className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full pl-14 pr-14 py-5 rounded-[1.5rem] transition-all outline-none text-sm font-medium",
                      isDark ? "bg-white/[0.03] border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50 backdrop-blur-xl" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn("absolute right-5 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 hover:text-white" : "text-gray-400 hover:text-gray-600")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {currentMode === 'register' && (
                <div>
                  <label className={cn("block text-[10px] font-black uppercase tracking-[0.2em] mb-3", isDark ? "text-gray-500" : "text-gray-700")}>Verify Protocol Key</label>
                  <div className="relative group">
                    <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "w-full pl-12 pr-12 py-4 rounded-2xl transition-all outline-none text-sm font-medium",
                        isDark ? "bg-white/5 border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={cn("absolute right-4 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 hover:text-white" : "text-gray-400 hover:text-gray-600")}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className={cn(
                  "w-full h-14 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center transition-all",
                  isDark
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                )}
                disabled={isLoading || isProcessing}
              >
                {isLoading || isProcessing ? 'Processing...' : currentMode === 'register' ? 'Initialize Node' : 'Authorize Access'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Phone Form */}
          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {phoneStep === 'number' ? (
                <div>
                  <label className={cn("block text-[10px] font-black uppercase tracking-[0.2em] mb-3", isDark ? "text-gray-500" : "text-gray-700")}>Protocol Device (Phone)</label>
                  <div className="relative group">
                    <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl transition-all outline-none text-sm font-medium",
                        isDark ? "bg-white/5 border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      )}
                      required
                    />
                  </div>
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-3", isDark ? "text-gray-600" : "text-gray-500")}>Enter 2FA-secured primary device number</p>
                </div>
              ) : (
                <div>
                  <label className={cn("block text-[10px] font-black uppercase tracking-[0.2em] mb-3", isDark ? "text-gray-500" : "text-gray-700")}>Authorization Code</label>
                  <div className="relative group">
                    <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-gray-600 group-focus-within:text-blue-500" : "text-gray-400")} size={18} />
                    <input
                      type="text"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      placeholder="XXXXXX"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl transition-all outline-none text-sm font-medium tracking-[0.5em]",
                        isDark ? "bg-white/5 border border-white/5 text-white focus:bg-white/10 focus:border-blue-500/50" : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      )}
                      required
                    />
                  </div>
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-3", isDark ? "text-gray-600" : "text-gray-500")}>Enter the 6-digit temporal access token</p>
                </div>
              )}

              <Button
                type="submit"
                className={cn(
                  "w-full h-14 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center transition-all",
                  isDark
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                )}
                disabled={isLoading || isProcessing}
              >
                {isLoading || isProcessing ? 'Processing...' : phoneStep === 'number' ? 'Request Token' : 'Validate Access'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Wallet Form */}
          {authMethod === 'wallet' && (
            <div className="py-4">
              <div className="mb-8 text-center">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                  isDark ? "bg-blue-600/10 border border-blue-500/20" : "bg-blue-50"
                )}>
                  <Fingerprint className={cn("w-10 h-10", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-400" : "text-gray-600")}>Anchor Secure Identity Access</p>
              </div>

              <Button
                onClick={handleWalletConnect || (() => { })}
                className={cn(
                  "w-full h-14 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center transition-all",
                  isDark
                    ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-xl"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                )}
                disabled={isLoading}
              >
                {isLoading ? 'Anchoring...' : 'Establish Secure Connection'}
                <Fingerprint className="ml-3 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isDark ? "text-gray-600" : "text-gray-500"
          )}>
            Protocol Governance: {' '}
            <a href="#" className="text-blue-500 hover:text-white transition-colors">Safety</a> • {' '}
            <a href="#" className="text-blue-500 hover:text-white transition-colors">Privacy</a> • {' '}
            <a href="#" className="text-blue-500 hover:text-white transition-colors">Terms</a>
          </p>
        </div>

        {/* Firebase reCAPTCHA Container - Required for Phone Auth */}
        <div id="recaptcha-container" className="hidden"></div>
      </motion.div>
    </div>
  );
}

export default LoginPage;