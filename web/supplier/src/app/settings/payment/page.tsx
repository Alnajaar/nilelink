"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard, Plus, Trash2, Check, AlertCircle,
    Building2, Mail, Shield, Eye, EyeOff, Loader2
} from 'lucide-react';

import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import AuthGuard from '@shared/components/AuthGuard';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { supplierApi } from '@shared/utils/api';

interface PaymentMethod {
    id: string;
    type: string;
    isDefault: boolean;
    cardLast4?: string;
    cardBrand?: string;
    stripePaymentMethodId?: string;
    createdAt: string;
}

export default function PaymentSettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [formLoading, setFormLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'credit_card' | 'paypal' | 'bank'>('credit_card');

    // Credit Card Form
    const [cardForm, setCardForm] = useState({
        number: '',
        expMonth: '',
        expYear: '',
        cvc: '',
        name: '',
        billingAddress: {
            line1: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'United States'
        }
    });

    // PayPal Form
    const [paypalForm, setPaypalForm] = useState({
        email: ''
    });

    // Bank Form
    const [bankForm, setBankForm] = useState({
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking' as 'checking' | 'savings',
        name: ''
    });

    const [showCardNumber, setShowCardNumber] = useState(false);
    const [showCVC, setShowCVC] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            loadPaymentMethods();
        }
    }, [authLoading]);

    const loadPaymentMethods = async () => {
        try {
            const data = await supplierApi.listPaymentMethods();
            setPaymentMethods(data);
        } catch (error) {
            console.error('Failed to load payment methods:', error);
        }
    };

    const handleAddCreditCard = async () => {
        setFormLoading(true);
        try {
            const data = await supplierApi.addPaymentMethod({
                type: 'credit_card',
                ...cardForm
            });
            setPaymentMethods(prev => [...prev, data as PaymentMethod]);
            setShowAddForm(false);
            setCardForm({
                number: '',
                expMonth: '',
                expYear: '',
                cvc: '',
                name: '',
                billingAddress: {
                    line1: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'United States'
                }
            });
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSetDefault = async (methodId: string) => {
        try {
            await supplierApi.setDefaultPaymentMethod(methodId);
            setPaymentMethods(prev =>
                prev.map(method => ({
                    ...method,
                    isDefault: method.id === methodId
                }))
            );
        } catch (error) {
            alert('Failed to set default payment method');
        }
    };

    const handleDelete = async (methodId: string) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return;

        try {
            await supplierApi.deletePaymentMethod(methodId);
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
        } catch (error) {
            alert('Failed to delete payment method');
        }
    };

    if (authLoading) return null;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50 antialiased">
                <main className="max-w-4xl mx-auto px-6 py-8 w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Payment Methods</h1>
                                <p className="text-slate-600">Manage your payment options for settlements and subscriptions</p>
                            </div>
                        </div>
                    </div>

                    {/* Existing Payment Methods */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Payment Methods</h2>

                        {paymentMethods.length === 0 ? (
                            <Card className="p-8 text-center">
                                <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No payment methods added</h3>
                                <p className="text-slate-600 mb-4">Add a payment method to receive settlements and manage subscriptions.</p>
                                <Button onClick={() => setShowAddForm(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Payment Method
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {paymentMethods.map((method) => (
                                    <Card key={method.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                                                    {method.type === 'credit_card' && <CreditCard className="w-6 h-6 text-slate-600" />}
                                                    {method.type === 'paypal' && <Mail className="w-6 h-6 text-slate-600" />}
                                                    {method.type === 'bank_account' && <Building2 className="w-6 h-6 text-slate-600" />}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900">
                                                            {method.type === 'credit_card' && `${method.cardBrand} **** ${method.cardLast4}`}
                                                            {method.type === 'paypal' && `PayPal Account`}
                                                            {method.type === 'bank_account' && `Bank Account ****${method.cardLast4}`}
                                                        </p>
                                                        {method.isDefault && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        Added {new Date(method.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!method.isDefault && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSetDefault(method.id)}
                                                    >
                                                        Set as Default
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(method.id)}
                                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                <Card className="p-6 border-dashed border-2 border-slate-300 hover:border-orange-300 transition-colors">
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="w-full flex items-center justify-center gap-3 text-slate-600 hover:text-orange-600 py-4"
                                    >
                                        <Plus className="w-6 h-6" />
                                        <span className="font-medium">Add New Payment Method</span>
                                    </button>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Add Payment Method Modal */}
                    {showAddForm && (
                        <Card className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-slate-900">Add Payment Method</h3>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
                                        { id: 'paypal', name: 'PayPal', icon: Mail },
                                        { id: 'bank', name: 'Bank Account', icon: Building2 }
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id as any)}
                                            className={`p-4 border-2 rounded-xl transition-all ${selectedMethod === method.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <method.icon className={`w-8 h-8 mx-auto mb-2 ${selectedMethod === method.id ? 'text-orange-600' : 'text-slate-600'
                                                }`} />
                                            <p className={`text-sm font-medium ${selectedMethod === method.id ? 'text-orange-600' : 'text-slate-700'
                                                }`}>
                                                {method.name}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Credit Card Form */}
                            {selectedMethod === 'credit_card' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={cardForm.number}
                                                onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value.replace(/\s/g, '') }))}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                maxLength={19}
                                            />
                                            <button
                                                onClick={() => setShowCardNumber(!showCardNumber)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showCardNumber ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Exp Month</label>
                                            <input
                                                type="text"
                                                value={cardForm.expMonth}
                                                onChange={(e) => setCardForm(prev => ({ ...prev, expMonth: e.target.value }))}
                                                placeholder="MM"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                maxLength={2}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Exp Year</label>
                                            <input
                                                type="text"
                                                value={cardForm.expYear}
                                                onChange={(e) => setCardForm(prev => ({ ...prev, expYear: e.target.value }))}
                                                placeholder="YYYY"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">CVC</label>
                                            <div className="relative">
                                                <input
                                                    type={showCVC ? 'text' : 'password'}
                                                    value={cardForm.cvc}
                                                    onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                                                    placeholder="123"
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    maxLength={4}
                                                />
                                                <button
                                                    onClick={() => setShowCVC(!showCVC)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showCVC ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={cardForm.name}
                                            onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                        <p className="text-sm text-yellow-800">
                                            Your payment information is encrypted and secure. We use industry-standard security measures.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddCreditCard} disabled={formLoading}>
                                            {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Add Credit Card
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* PayPal Form */}
                            {selectedMethod === 'paypal' && (
                                <div className="space-y-4">
                                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                                        <Mail className="w-8 h-8 text-blue-600 mb-3" />
                                        <h4 className="font-medium text-blue-900 mb-2">PayPal Integration</h4>
                                        <p className="text-sm text-blue-800 mb-4">
                                            Connect your PayPal account to receive payments and manage subscriptions. You'll be redirected to PayPal for verification.
                                        </p>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            Connect PayPal Account
                                        </Button>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Bank Account Form */}
                            {selectedMethod === 'bank' && (
                                <div className="space-y-4">
                                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                                        <Building2 className="w-8 h-8 text-green-600 mb-3" />
                                        <h4 className="font-medium text-green-900 mb-2">Bank Account Integration</h4>
                                        <p className="text-sm text-green-800 mb-4">
                                            Connect your bank account for direct deposits and automated settlements. Your information is securely encrypted.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Account Holder Name</label>
                                        <input
                                            type="text"
                                            value={bankForm.name}
                                            onChange={(e) => setBankForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Routing Number</label>
                                            <input
                                                type="text"
                                                value={bankForm.routingNumber}
                                                onChange={(e) => setBankForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                                                placeholder="123456789"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                maxLength={9}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
                                            <select
                                                value={bankForm.accountType}
                                                onChange={(e) => setBankForm(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="checking">Checking</option>
                                                <option value="savings">Savings</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            value={bankForm.accountNumber}
                                            onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                                            placeholder="Account number"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                            Cancel
                                        </Button>
                                        <Button disabled>
                                            Add Bank Account (Coming Soon)
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}