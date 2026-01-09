"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard,
    Wallet,
    Building2,
    Smartphone,
    Banknote,
    Plus,
    Trash2,
    Shield,
    CheckCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Input } from '@/shared/components/Input';

export default function PaymentMethodsPage() {
    const router = useRouter();
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: '1',
            type: 'card',
            name: 'Business Visa ****4242',
            provider: 'Visa',
            status: 'active',
            lastUsed: '2024-12-28'
        },
        {
            id: '2',
            type: 'bank',
            name: 'Main Business Account',
            provider: 'Chase Bank',
            status: 'active',
            lastUsed: '2024-12-27'
        }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const paymentTypes = [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: CreditCard,
            description: 'Visa, Mastercard, American Express',
            color: 'bg-primary/10 text-primary border-primary/20'
        },
        {
            id: 'bank',
            name: 'Bank Transfer',
            icon: Building2,
            description: 'Direct bank account connection',
            color: 'bg-success/10 text-success border-success/20'
        },
        {
            id: 'wallet',
            name: 'Crypto Wallet',
            icon: Wallet,
            description: 'Blockchain payment methods',
            color: 'bg-secondary/10 text-secondary border-secondary/20'
        },
        {
            id: 'mobile',
            name: 'Mobile Money',
            icon: Smartphone,
            description: 'Wish Money, OMT, and other services',
            color: 'bg-info/10 text-info border-info/20'
        },
        {
            id: 'cash',
            name: 'Cash Payment',
            icon: Banknote,
            description: 'Physical cash transactions',
            color: 'bg-warning/10 text-warning border-warning/20'
        }
    ];

    const handleAddPaymentMethod = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newMethod = {
            id: Date.now().toString(),
            type: selectedType,
            name: selectedType === 'card' ? 'New Card ****1234' :
                  selectedType === 'bank' ? 'New Bank Account' :
                  selectedType === 'wallet' ? 'Crypto Wallet' :
                  selectedType === 'mobile' ? 'Mobile Money Account' :
                  'Cash Payment Method',
            provider: selectedType === 'card' ? 'New Card' :
                     selectedType === 'bank' ? 'New Bank' :
                     selectedType === 'wallet' ? 'MetaMask' :
                     selectedType === 'mobile' ? 'Wish Money' :
                     'Cash',
            status: 'active' as const,
            lastUsed: new Date().toISOString().split('T')[0]
        };

        setPaymentMethods([...paymentMethods, newMethod]);
        setShowAddForm(false);
        setIsProcessing(false);
    };

    const handleRemovePaymentMethod = (id: string) => {
        setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-text-main mb-2">Payment Methods</h1>
                    <p className="text-text-muted font-medium text-lg">Manage your business payment gateways and methods</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.push('/admin/subscription')}>
                        💎 Subscription
                    </Button>
                    <Button onClick={() => setShowAddForm(true)} className="gap-2">
                        <Plus size={18} />
                        Add Payment Method
                    </Button>
                </div>
            </div>

            {/* Current Payment Methods */}
            <div className="grid md:grid-cols-2 gap-6">
                {paymentMethods.map((method) => (
                    <Card key={method.id} className="p-6 border-border-subtle">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${
                                    method.type === 'card' ? 'bg-primary/10 text-primary' :
                                    method.type === 'bank' ? 'bg-success/10 text-success' :
                                    method.type === 'wallet' ? 'bg-secondary/10 text-secondary' :
                                    method.type === 'mobile' ? 'bg-info/10 text-info' :
                                    'bg-warning/10 text-warning'
                                }`}>
                                    {method.type === 'card' && <CreditCard size={24} />}
                                    {method.type === 'bank' && <Building2 size={24} />}
                                    {method.type === 'wallet' && <Wallet size={24} />}
                                    {method.type === 'mobile' && <Smartphone size={24} />}
                                    {method.type === 'cash' && <Banknote size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-text-main text-lg">{method.name}</h3>
                                    <p className="text-sm text-text-muted font-medium">{method.provider}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={method.status === 'active' ? 'success' : 'neutral'}>
                                    {method.status}
                                </Badge>
                                <button
                                    onClick={() => handleRemovePaymentMethod(method.id)}
                                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted font-medium">Last used: {method.lastUsed}</span>
                            <span className="text-text-muted font-medium">Auto-payment enabled</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add Payment Method Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-text-main">Add Payment Method</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="p-2 hover:bg-background-subtle rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Payment Type Selection */}
                        <div className="mb-8">
                            <h3 className="font-black text-text-main mb-4">Choose Payment Type</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paymentTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                            selectedType === type.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border-subtle bg-background-subtle hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${type.color.split(' ')[0]}`}>
                                                <type.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-text-main">{type.name}</h4>
                                                <p className="text-sm text-text-muted">{type.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="space-y-6">
                            {selectedType === 'card' && (
                                <div className="space-y-4">
                                    <Input placeholder="Card Number" type="text" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input placeholder="MM/YY" />
                                        <Input placeholder="CVV" type="password" />
                                    </div>
                                    <Input placeholder="Cardholder Name" />
                                </div>
                            )}

                            {selectedType === 'bank' && (
                                <div className="space-y-4">
                                    <Input placeholder="Bank Name" />
                                    <Input placeholder="Account Number" />
                                    <Input placeholder="Routing Number" />
                                    <Input placeholder="Account Holder Name" />
                                </div>
                            )}

                            {selectedType === 'wallet' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                                        <p className="text-sm text-secondary font-medium mb-2">
                                            Connect your blockchain wallet for crypto payments
                                        </p>
                                        <Button variant="outline" className="w-full gap-2">
                                            <Wallet size={16} />
                                            Connect MetaMask
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedType === 'mobile' && (
                                <div className="space-y-4">
                                    <select className="w-full h-14 px-4 bg-background-subtle rounded-2xl font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary border-transparent">
                                        <option value="wish">Wish Money</option>
                                        <option value="omt">OMT</option>
                                        <option value="other">Other Mobile Money</option>
                                    </select>
                                    <Input placeholder="Mobile Number" />
                                    <Input placeholder="Account Name" />
                                </div>
                            )}

                            {selectedType === 'cash' && (
                                <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl text-center">
                                    <Banknote size={32} className="text-warning mx-auto mb-2" />
                                    <p className="text-warning font-medium">
                                        Cash payments are handled automatically by the POS system
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddPaymentMethod}
                                    isLoading={isProcessing}
                                    className="flex-1 gap-2"
                                >
                                    {isProcessing ? 'Adding...' : 'Add Payment Method'}
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Payment Gateway Integration */}
            <Card className="p-8">
                <h2 className="text-2xl font-black text-text-main mb-6">Payment Gateway Integration</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            name: 'Stripe',
                            status: 'connected',
                            description: 'Primary payment processor',
                            icon: '💳'
                        },
                        {
                            name: 'PayPal',
                            status: 'available',
                            description: 'Alternative payment method',
                            icon: '🅿️'
                        },
                        {
                            name: 'Crypto',
                            status: 'connected',
                            description: 'Blockchain payments',
                            icon: '₿'
                        }
                    ].map((gateway, idx) => (
                        <div key={idx} className="p-6 bg-background-subtle rounded-2xl border border-border-subtle">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{gateway.icon}</span>
                                    <div>
                                        <h4 className="font-black text-text-main">{gateway.name}</h4>
                                        <p className="text-sm text-text-muted">{gateway.description}</p>
                                    </div>
                                </div>
                                <Badge variant={gateway.status === 'connected' ? 'success' : 'neutral'}>
                                    {gateway.status}
                                </Badge>
                            </div>

                            <Button
                                size="sm"
                                variant={gateway.status === 'connected' ? 'outline' : 'primary'}
                                className="w-full"
                                disabled={gateway.status === 'connected'}
                            >
                                {gateway.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Security Notice */}
            <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                    <Shield size={24} className="text-primary mt-1" />
                    <div>
                        <h4 className="font-black text-primary mb-2">Payment Security</h4>
                        <p className="text-text-muted font-medium text-sm leading-relaxed">
                            All payment information is encrypted and secured using industry-standard protocols.
                            We never store sensitive payment details on our servers. Your financial data is protected
                            by bank-level security and blockchain immutability.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
