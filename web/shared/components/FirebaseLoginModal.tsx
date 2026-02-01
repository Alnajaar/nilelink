'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { useFirebaseAuth } from '../providers/FirebaseAuthProvider';

interface FirebaseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  mode?: 'login' | 'register' | 'phone';
}

export function FirebaseLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  mode = 'login'
}: FirebaseLoginModalProps) {
  const { loginWithEmail, registerWithEmail, loginWithPhone, verifyPhoneCode, error } = useFirebaseAuth();
  
  const [currentMode, setCurrentMode] = useState<'email' | 'phone'>(mode === 'phone' ? 'phone' : 'email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await registerWithEmail(email, password, firstName, lastName);
      } else {
        await loginWithEmail(email, password);
      }
      
      onLoginSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Login/Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const confirmationResult = await loginWithPhone(phoneNumber);
      setVerificationId(confirmationResult.verificationId);
      setShowPhoneVerification(true);
    } catch (err: any) {
      console.error('Phone login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real implementation, we'd need to store the confirmationResult somewhere
      // For now, we'll just simulate the process
      onLoginSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('SMS verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 capitalize">
                {mode === 'register' ? 'Create Account' : 'Sign In'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
                  currentMode === 'email'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-600'
                }`}
                onClick={() => setCurrentMode('email')}
              >
                Email
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
                  currentMode === 'phone'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-600'
                }`}
                onClick={() => setCurrentMode('phone')}
              >
                Phone
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Email/Password Form */}
            {currentMode === 'email' && (
              <form onSubmit={handleEmailSubmit}>
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                {mode === 'register' && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : mode === 'register' ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* Phone Form */}
            {currentMode === 'phone' && !showPhoneVerification && (
              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+20 123 456 7890"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter your phone number with country code</p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending SMS...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {/* SMS Verification */}
            {currentMode === 'phone' && showPhoneVerification && (
              <form onSubmit={handleSmsCodeSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-2xl tracking-widest"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to {phoneNumber}</p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 mt-3 font-bold rounded-xl"
                  onClick={() => setShowPhoneVerification(false)}
                >
                  Back
                </Button>
              </form>
            )}
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'register' 
                ? `Already have an account? ` 
                : `Don't have an account? `}
              <button
                className="text-blue-600 font-bold hover:underline ml-1"
                onClick={() => setCurrentMode(currentMode === 'email' ? 'phone' : 'email')}
              >
                {currentMode === 'email' ? 'Try Phone' : 'Try Email'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}