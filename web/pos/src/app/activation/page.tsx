'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertCircle, CheckCircle, Smartphone, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@shared/providers/AuthProvider';
import { subscriptionEngine } from '@shared/services/SubscriptionEngine';

export default function ActivationPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!code || code.length < 5) {
                throw new Error('Invalid code format. Please check your email.');
            }

            if (!user?.uid) {
                throw new Error('Session invalid. Please login again.');
            }

            // Call real validation API
            const response = await fetch('/api/activations/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.trim(),
                    businessId: user.uid
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                // Update local storage flag
                localStorage.setItem('nilelink_activation_status', 'ACTIVE');

                // Redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                throw new Error(data.error || 'Access Denied: Invalid or Expired Code.');
            }

        } catch (err: any) {
            console.error('Activation Error:', err);
            setError(err.message || 'Activation failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Security Grid Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

            <div className="w-full max-w-md relative z-10 text-center">

                {/* Header Icon */}
                <div className="w-24 h-24 mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-black border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                        <Lock size={40} className="text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
                    Access Restricted
                </h1>

                <p className="text-zinc-400 font-medium mb-12 leading-relaxed">
                    Your node configuration is <span className="text-white font-bold">Pending Activation</span>.
                    <br />
                    Security protocols require a valid <span className="text-red-400 font-mono">License Key</span> to initialize the commercial operating system.
                </p>

                {/* Activation Form */}
                <form onSubmit={handleActivation} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-xl mb-12 shadow-2xl">
                    <div className="space-y-6">
                        <div className="text-left">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block ml-2">Enter License Key</label>
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="NL-XXXX-XXXX"
                                className="w-full h-16 bg-black border border-zinc-800 rounded-xl text-center text-xl font-mono text-white tracking-widest outline-none focus:border-red-500 transition-all uppercase placeholder-zinc-800"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-left">
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                                <p className="text-red-400 text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-xl flex items-center gap-3 text-left">
                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                <p className="text-green-400 text-xs font-bold leading-tight">Key Verified. Uplinking...</p>
                            </div>
                        )}

                        <Button
                            disabled={isLoading || success}
                            className={`w-full h-16 rounded-xl font-black uppercase tracking-[0.2em] transition-all
                                 ${success ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            {isLoading ? 'Verifying...' : success ? 'Access Granted' : 'Initialize Node'}
                        </Button>
                    </div>
                </form>

                {/* Support Channel */}
                <div className="border-t border-zinc-800 pt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">Support Channels</p>

                    <div className="grid grid-cols-2 gap-4">
                        <a href="tel:+15550123456" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all group">
                            <Smartphone size={20} className="text-zinc-500 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold text-zinc-400">+961 719-724-95</span>
                        </a>
                        <a href="mailto:support@nilelink.com" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all group">
                            <Mail size={20} className="text-zinc-500 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold text-zinc-400">support@nilelink.com</span>
                        </a>
                    </div>

                    <p className="mt-8 text-[10px] text-zinc-700 max-w-xs mx-auto leading-relaxed">
                        Payment verification typically processes within <span className="text-zinc-500">2-4 business hours</span>.
                        If you have already completed the transaction, please check your registered email for the Key.
                    </p>
                </div>
            </div>
        </div>
    );
}
