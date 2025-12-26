'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { authApi } from '@/shared/utils/api';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Store } from 'lucide-react';

export default function POSLoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('owner@nilelink.app');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authApi.login(email, password) as any;
            login(response.token, response.user);
            router.push('/terminal');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#0e372b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-xl shadow-black/5" padding="lg">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
                        <Store size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main">Merchant Terminal</h1>
                    <p className="text-text-muted text-sm mt-1">Sign in to access local ledger</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        label="Store Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="store@nilelink.app"
                        required
                        autoFocus
                    />

                    <Input
                        label="Access Key"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    {error && (
                        <div className="bg-danger/5 border border-danger/10 text-danger text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                            <span className="font-bold">!</span> {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                    >
                        Initialize Terminal
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-subtle">
                    <p className="text-xs font-semibold text-text-main mb-3 uppercase tracking-wider">Debug Credentials</p>
                    <div className="bg-background-subtle rounded-lg p-3 text-xs text-text-muted font-mono space-y-1 border border-border-subtle">
                        <div className="flex justify-between">
                            <span>owner@nilelink.app</span>
                            <span className="opacity-50">password123</span>
                        </div>
                        <div className="flex justify-between">
                            <span>manager@nilelink.app</span>
                            <span className="opacity-50">password123</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
