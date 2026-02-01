"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebaseAuth } from '@shared/providers/FirebaseAuthProvider';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { Phone, Mail, UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AuthPage() {
    const { loginWithEmail, registerWithEmail, loginWithPhone, verifyPhoneCode, isLoading, error, logout } = useFirebaseAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [showPhoneAuth, setShowPhoneAuth] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(true);



    const handleSendOtp = async () => {
        if (!email && !phoneNumber) {
            alert('Please enter email or phone number');
            return;
        }
        
        try {
            if (authMethod === 'phone' && phoneNumber) {
                // Handle phone authentication
                const confirmationResult = await loginWithPhone(phoneNumber);
                (window as any).confirmationResult = confirmationResult; // Store globally for verification
                setOtpSent(true);
            } else if (authMethod === 'email' && email) {
                // For email, we'll handle login/register directly
                if (isRegister) {
                    await registerWithEmail(email, password, firstName, lastName);
                    // After registration, redirect to onboarding
                    router.push('/onboarding/supplier-info');
                } else {
                    await loginWithEmail(email, password);
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            console.error('Authentication error:', err);
            alert(err.message || 'Authentication failed');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const confirmationResult = (window as any).confirmationResult;
            if (!confirmationResult) {
                alert('Verification code not found. Please resend OTP.');
                return;
            }
            
            await verifyPhoneCode(confirmationResult, verificationCode);
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Verification error:', err);
            alert(err.message || 'Verification failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                        {isRegister ? 'Register for NileLink' : 'Login to NileLink'}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        {isRegister ? 'Create your account' : 'Access your account'}
                    </p>
                </div>
                <div className="space-y-4">

                    <div className="space-y-4">
                        {/* Authentication method selector */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMethod('email');
                                    setShowEmailAuth(true);
                                    setShowPhoneAuth(false);
                                }}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMethod === 'email' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMethod('phone');
                                    setShowEmailAuth(false);
                                    setShowPhoneAuth(true);
                                }}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMethod === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
                            >
                                Phone
                            </button>
                        </div>
                        
                        {!otpSent ? (
                            <div className="space-y-4">
                                {showEmailAuth && (
                                    <>
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            icon={<Mail className="w-5 h-5" />}
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                                        />
                                        {isRegister && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {showPhoneAuth && (
                                    <Input
                                        type="tel"
                                        placeholder="Enter your phone number (+1234567890)"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        icon={<Phone className="w-5 h-5" />}
                                    />
                                )}
                                
                                <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Login')} {authMethod === 'email' ? 'with Email' : 'with Phone'}
                                    <ArrowRight className="ml-2" size={16} />
                                </Button>
                                
                                {error && (
                                    <div className="text-red-500 text-sm text-center mt-2">{error}</div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Enter verification code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>}
                                />
                                <Button onClick={handleVerifyOtp} className="w-full">
                                    Verify & {isRegister ? 'Complete Registration' : 'Login'}
                                </Button>
                                <Button 
                                    onClick={() => setOtpSent(false)}
                                    variant="ghost"
                                    className="w-full"
                                >
                                    Back
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <button onClick={() => {
                            setIsRegister(!isRegister);
                            setOtpSent(false);
                            setEmail('');
                            setPhoneNumber('');
                        }} className="text-primary hover:underline flex items-center justify-center gap-2">
                            {isRegister ? <ArrowLeft className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            {isRegister ? 'Already have an account? Login' : 'New to NileLink? Register here'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}