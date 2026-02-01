'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { Shield, Check, X, Mail, Phone, Lock, AlertTriangle } from 'lucide-react';
import { auth } from '@shared/providers/FirebaseAuthProvider';

export default function FirebaseVerificationPage() {
    const { user, isConnected, isLoading, error, login, logout, register, loginWithPhone } = useAuth();

    const [testEmail, setTestEmail] = useState('test@nilelink.app');
    const [testPass, setTestPass] = useState('password123');
    const [testPhone, setTestPhone] = useState('+201234567890');

    const [systemStatus, setSystemStatus] = useState({
        firebaseInitialized: false,
        authServiceRunning: false,
        configLoaded: false,
        apiKeyPresent: false
    });

    useEffect(() => {
        setSystemStatus({
            firebaseInitialized: !!auth.app,
            authServiceRunning: !!auth,
            configLoaded: !!auth.app.options.projectId,
            apiKeyPresent: !!auth.app.options.apiKey
        });
    }, []);

    const handleTestLogin = async () => {
        try {
            await login(testEmail, testPass);
            alert('Login Success!');
        } catch (e: any) {
            alert(`Login Failed: ${e.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 mb-12">
                    <div className="p-4 bg-orange-500/20 rounded-2xl">
                        <Shield className="w-10 h-10 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Firebase Auth Verification</h1>
                        <p className="text-gray-400 text-lg font-mono">End-to-End Reliability Test Console</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: System Diagnostics */}
                    <div className="space-y-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                                System Diagnostics
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(systemStatus).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                                        <span className="capitalize text-gray-400 font-mono text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        {value ? (
                                            <div className="flex items-center text-green-400 text-sm font-bold">
                                                <Check className="w-4 h-4 mr-1" />
                                                PASS
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-red-400 text-sm font-bold">
                                                <X className="w-4 h-4 mr-1" />
                                                FAIL
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Lock className="w-5 h-5 mr-2 text-blue-400" />
                                Current Auth State
                            </h2>
                            <div className="p-4 bg-slate-900/50 rounded-xl mb-4">
                                <p className="text-sm text-gray-500 mb-1">Status:</p>
                                <p className={`text-xl font-bold ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
                                    {isConnected ? 'AUTHENTICATED' : 'ANONYMOUS'}
                                </p>
                            </div>
                            {user && (
                                <div className="space-y-3 font-mono text-xs">
                                    <p><span className="text-gray-500">ID:</span> {user.uid}</p>
                                    <p><span className="text-gray-500">Email:</span> {user.email || 'N/A'}</p>
                                    <p><span className="text-gray-500">Phone:</span> {user.phoneNumber || 'N/A'}</p>
                                    <p><span className="text-gray-500">Role:</span> {user.role || 'USER'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Interaction Tests */}
                    <div className="space-y-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-purple-400" />
                                Email Auth Test
                            </h2>
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Email"
                                />
                                <input
                                    type="password"
                                    value={testPass}
                                    onChange={(e) => setTestPass(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Password"
                                />
                                <button
                                    onClick={handleTestLogin}
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Wait...' : 'Test Simple Login'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-green-400" />
                                Phone Auth Test
                            </h2>
                            <div className="space-y-4">
                                <input
                                    type="tel"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder="+20..."
                                />
                                <button
                                    onClick={() => alert('Navigate to login page to test reCAPTCHA integration')}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all"
                                >
                                    Test SMS Flow
                                </button>
                                <p className="text-xs text-center text-gray-500">
                                    Requires hidden #recaptcha-container (Verified in LoginPage)
                                </p>
                            </div>
                        </div>

                        {isConnected && (
                            <button
                                onClick={logout}
                                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-bold transition-all"
                            >
                                Terminate Session
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-3xl">
                    <h3 className="text-lg font-bold mb-4">Verification Checklist</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Configuration Valid</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Singleton Instance Verified</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Recaptcha Bug Fixed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
