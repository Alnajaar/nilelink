'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { ShieldCheck } from 'lucide-react';

export default function InvestorLoginPage() {
    const router = useRouter();
    const [id, setId] = useState('');
    const [key, setKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            setIsLoading(false);
            router.push('/overview');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#0e372b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-xl shadow-black/5" padding="lg">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main">Treasury Vault</h1>
                    <p className="text-text-muted text-sm mt-1">Authorized Audit Access Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        label="Wallet / Auditor ID"
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="0x..."
                        required
                        autoFocus
                    />
                    <Input
                        label="Private Key / Phrase"
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
                        Verify Credentials
                    </Button>
                </form>
            </Card>
        </div>
    );
}
