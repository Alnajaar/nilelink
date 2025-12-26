"use client";

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Lock, User, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OpenShiftPage() {
    const router = useRouter();
    const [floatAmount, setFloatAmount] = useState('150.00');

    const handleOpenShift = () => {
        router.push('/terminal');
    };

    return (
        <div className="h-full flex items-center justify-center bg-background-light p-6">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-dark/10 text-primary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-primary-dark">Open Shift</h1>
                    <p className="text-text-secondary">Start your selling session by declaring opening cash.</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-black/5 p-4 rounded-lg flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-dark">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-text-secondary">Logged in as</p>
                            <p className="font-bold text-primary-dark">Cashier Station #1</p>
                        </div>
                    </div>

                    <Input
                        label="Opening Float Amount"
                        value={floatAmount}
                        onChange={(e) => setFloatAmount(e.target.value)}
                        type="number"
                        leftIcon={<DollarSign size={16} />}
                        className="text-lg font-mono font-bold"
                    />

                    <Button onClick={handleOpenShift} className="w-full h-12 text-lg">
                        Start Shift
                    </Button>
                </div>
            </Card>
        </div>
    );
}
