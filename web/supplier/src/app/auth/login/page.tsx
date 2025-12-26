'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Layers } from 'lucide-react';

export default function SupplierLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            setIsLoading(false);
            router.push('/orders');
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
                        <Layers size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main">Supplier Portal</h1>
                    <p className="text-text-muted text-sm mt-1">Inventory & Fulfillment Management</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        label="Business Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="logistics@partner.com"
                        required
                        autoFocus
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
                        Access Dashboard
                    </Button>
                </form>
            </Card>
        </div>
    );
}
