'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@shared/providers/FirebaseAuthProvider';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { Loader2, Phone, Mail, Eye, EyeOff, Wallet } from 'lucide-react';
import firebaseAuthService from '../services/FirebaseService';
import { useNotifications } from '../contexts/NotificationContext';
import { useWallet } from '../contexts/WalletContext';
import { SiweMessage } from 'siwe';
import { useAuth } from '../providers/FirebaseAuthProvider';

interface AuthFormProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  mode: 'login' | 'register';
  appName: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onError, mode, appName }) => {
  const { addNotification } = useNotifications();
  const { loginWithWallet, loginWithPhone, verifyPhoneCode } = useAuth();
  const { wallet, connectWallet, signMessage } = useWallet();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'wallet'>('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);



  const handleWalletAuth = async () => {
    try {
      setLoading(true);

      // 1. Connect wallet if not connected
      if (!wallet.isConnected) {
        await connectWallet('metamask');
      }

      const address = (window as any).ethereum?.selectedAddress || wallet.address;
      if (!address) throw new Error('Wallet not connected');

      // 2. Prepare SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: `Sign in to ${appName} with your wallet.`,
        uri: window.location.origin,
        version: '1',
        chainId: wallet.chainId || 1,
        nonce: Math.random().toString(36).substring(2)
      });

      const signature = await signMessage(message.prepareMessage());

      // 3. Authenticate with backend
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          signature,
          address
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Wallet authentication failed');

      // 4. Sign in to Firebase CID
      await loginWithWallet(data.token);

      addNotification({
        title: 'Welcome!',
        message: 'Successfully authenticated with wallet.',
        type: 'success'
      });

      onSuccess({ uid: data.user.uid });

    } catch (err: any) {
      console.error('Wallet Auth Error:', err);
      onError(err.message || 'Wallet authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          onError('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = await firebaseAuthService.signUpWithEmail(email, password, `${firstName} ${lastName}`);
        if (result.success) {
          addNotification({
            title: 'Account Created',
            message: `Welcome to NileLink! Please verify your email ${email}.`,
            type: 'success'
          });
          onSuccess(result.user);
        } else {
          onError(result.error || 'Registration failed');
        }
      } else {
        const result = await firebaseAuthService.signInWithEmail(email, password);
        if (result.success) {
          addNotification({
            title: 'Sign In Successful',
            message: `Welcome back, ${email}`,
            type: 'success'
          });
          onSuccess(result.user);
        } else {
          onError(result.error || 'Login failed');
        }
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      onError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      onError('Please enter your email address first');
      return;
    }
    setLoading(true);
    try {
      const result = await firebaseAuthService.sendPasswordResetEmail(email);
      if (result.success) {
        addNotification({
          title: 'Reset Email Sent',
          message: 'If an account exists, you will receive reset instructions shortly.',
          type: 'info'
        });
        onError('Password reset email sent. Please check your inbox.');
      } else {
        onError(result.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the provider's loginWithPhone method which handles reCAPTCHA internally
      const result = await loginWithPhone(phoneNumber);
      setConfirmationResult(result);
      setStep('verify');
      onError(''); // Clear any previous errors
    } catch (error: any) {
      console.error('Phone auth error:', error);
      onError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!confirmationResult) {
        onError('No verification in progress');
        return;
      }

      // Use the provider's verifyPhoneCode method
      const result = await verifyPhoneCode(confirmationResult, verificationCode);
      addNotification({
        title: 'Phone Verified',
        message: 'Your phone number has been successfully verified.',
        type: 'success'
      });
      // The onAuthStateChanged in the provider will update the user state
      // We can safely call onSuccess with a minimal user object since the provider handles the rest
      onSuccess({ uid: 'phone-verified' });
    } catch (error: any) {
      console.error('Verification error:', error);
      onError(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setStep('input');
    setVerificationCode('');
    setConfirmationResult(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'login' ? 'Sign In' : 'Create Account'} - {appName}
        </CardTitle>
        <CardDescription className="text-center">
          Choose your preferred authentication method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              {mode === 'login' && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs opacity-60 hover:opacity-100"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot your password?
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            {step === 'input' ? (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your phone number with country code (e.g., +1 for US)
                  </p>
                </div>


                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Verification Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to {phoneNumber}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetPhoneAuth}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Verify & {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="wallet">
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg">Web3 Authentication</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Sign in securely using your decentralized identity. No passwords needed.
                </p>
              </div>

              {wallet.isConnected ? (
                <div className="w-full space-y-4">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Connected:</span>
                    <span className="font-mono font-bold text-primary">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                  </div>
                  <Button
                    onClick={handleWalletAuth}
                    className="w-full py-6 text-base font-bold"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    Sign In with Wallet
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => connectWallet('metamask')}
                  variant="outline"
                  className="w-full py-6 text-base font-bold border-2 hover:bg-primary/5 transition-all"
                  disabled={loading}
                >
                  Connect Metamask
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                Powered by NileLink SIWE
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-col space-y-2">
          {authMethod !== 'wallet' && (
            <Button
              variant="outline"
              onClick={() => setAuthMethod('wallet')}
              className="w-full bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-all font-bold"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Continue with Web3 Wallet
            </Button>
          )}

          <Button
            variant="link"
            onClick={() => {
              if (authMethod === 'wallet') setAuthMethod('email');
              else setAuthMethod(authMethod === 'email' ? 'phone' : 'email');
            }}
            className="text-sm text-muted-foreground"
          >
            {authMethod === 'email' ? 'Use phone number instead' :
              authMethod === 'phone' ? 'Use email address instead' :
                'Use email or phone instead'}
          </Button>
        </div>
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
};
