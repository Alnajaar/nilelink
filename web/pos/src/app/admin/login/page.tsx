'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@shared/providers/AuthProvider';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Admin Protocol: Login Only
            await login(email, password);

            // Check if this is actually an admin (simple email check for MVP or relies on RBAC)
            // For now, we allow login and let the dashboard enforce permissions/redirect
            router.push('/admin/dashboard');

        } catch (err: any) {
            console.error('Admin Access Denied:', err);
            setError('Access Denied: Invalid cryptographic credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[url('/grid.svg')]">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[2rem] shadow-2xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Platform Control</h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Restricted Access // Level 5</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block ml-2">Admin Identity</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@nilelink.network"
                            className="w-full h-14 bg-black border border-zinc-800 rounded-xl px-4 text-white font-medium focus:border-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block ml-2">Passkey</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full h-14 bg-black border border-zinc-800 rounded-xl px-4 text-white font-medium focus:border-white transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl">
                            <p className="text-red-400 text-xs font-bold text-center uppercase tracking-wide">{error}</p>
                        </div>
                    )}

                    <Button
                        disabled={isLoading}
                        className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {isLoading ? 'Authenticating...' : 'Enter Console'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
