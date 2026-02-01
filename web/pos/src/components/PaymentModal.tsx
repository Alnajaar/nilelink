'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, DollarSign, Smartphone, CheckCircle,
    AlertCircle, Loader2, X, Wallet, Receipt
} from 'lucide-react';
import { usdcService, PaymentRequest, PaymentResult } from '@/lib/payments/USDCService';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    orderId?: string;
    description?: string;
    onPaymentComplete: (result: PaymentResult) => void;
}

type PaymentMethod = 'usdc' | 'cash' | 'card';

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    orderId,
    description,
    onPaymentComplete
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('usdc');
    const [isProcessing, setIsProcessing] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [usdcBalance, setUsdcBalance] = useState<number>(0);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            checkWalletConnection();
        }
    }, [isOpen]);

    const checkWalletConnection = async () => {
        try {
            const isConnected = usdcService.isConnected();
            setWalletConnected(isConnected);

            if (isConnected) {
                const balance = await usdcService.getBalance();
                setUsdcBalance(balance.balance);
                setWalletAddress(await usdcService.connectWallet());
            }
        } catch (error) {
            console.error('Failed to check wallet connection:', error);
        }
    };

    const connectWallet = async () => {
        try {
            setError('');
            const address = await usdcService.connectWallet();
            setWalletAddress(address);
            setWalletConnected(true);

            const balance = await usdcService.getBalance();
            setUsdcBalance(balance.balance);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const processPayment = async () => {
        if (selectedMethod === 'usdc' && !walletConnected) {
            setError('Please connect your wallet first');
            return;
        }

        setIsProcessing(true);
        setError('');
        setPaymentResult(null);

        try {
            let result: PaymentResult;

            if (selectedMethod === 'usdc') {
                const web3Service = (await import('@shared/services/Web3Service')).default;
                const businessAddress = await web3Service.getWalletAddress();

                const paymentRequest: PaymentRequest = {
                    amount,
                    recipient: businessAddress || '0x0000000000000000000000000000000000000000',
                    description: description || `Payment for order ${orderId}`,
                    orderId
                };

                result = await usdcService.transfer(paymentRequest);
            } else {
                // Mock payment processing for cash/card
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

                result = {
                    success: true,
                    transactionHash: `mock_tx_${Date.now()}`,
                    amount,
                    timestamp: Date.now()
                };
            }

            setPaymentResult(result);
            onPaymentComplete(result);

            if (result.success) {
                // Auto-close after successful payment
                setTimeout(() => {
                    onClose();
                }, 3000);
            }

        } catch (error: any) {
            setPaymentResult({
                success: false,
                error: error.message
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const paymentMethods = [
        {
            id: 'usdc' as PaymentMethod,
            name: 'USDC Crypto',
            icon: Wallet,
            description: 'Pay with USDC cryptocurrency',
            available: true,
            requiresWallet: true
        },
        {
            id: 'card' as PaymentMethod,
            name: 'Credit/Debit Card',
            icon: CreditCard,
            description: 'Pay with credit or debit card',
            available: true,
            requiresWallet: false
        },
        {
            id: 'cash' as PaymentMethod,
            name: 'Cash',
            icon: DollarSign,
            description: 'Pay with physical cash',
            available: true,
            requiresWallet: false
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                                    <p className="text-gray-600 mt-1">
                                        {description || `Order ${orderId || 'N/A'}`}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isProcessing}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-96">
                            {/* Amount Display */}
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-gray-900">
                                    ${amount.toFixed(2)}
                                </div>
                                <p className="text-gray-500 mt-1">Total amount due</p>
                            </div>

                            {/* Payment Methods */}
                            {!paymentResult && (
                                <div className="space-y-3 mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={`w-full p-4 border rounded-lg text-left transition-all ${selectedMethod === method.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            disabled={!method.available}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                                                    }`} />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{method.name}</div>
                                                    <div className="text-sm text-gray-500">{method.description}</div>
                                                </div>
                                                {selectedMethod === method.id && (
                                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* USDC Wallet Connection */}
                            {selectedMethod === 'usdc' && !paymentResult && (
                                <div className="mb-6">
                                    {!walletConnected ? (
                                        <div className="text-center p-4 border border-gray-200 rounded-lg">
                                            <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600 mb-3">Connect your wallet to pay with USDC</p>
                                            <Button onClick={connectWallet} className="w-full">
                                                <Wallet className="w-4 h-4 mr-2" />
                                                Connect Wallet
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-green-800">Wallet Connected</span>
                                                <Badge variant="success" className="text-xs">Active</Badge>
                                            </div>
                                            <p className="text-xs text-green-700 font-mono">
                                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                            </p>
                                            <p className="text-sm text-green-800 mt-2">
                                                Balance: ${usdcBalance.toFixed(2)} USDC
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-800">{error}</span>
                                </div>
                            )}

                            {/* Payment Result */}
                            {paymentResult && (
                                <div className={`p-4 rounded-lg border ${paymentResult.success
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                    }`}>
                                    <div className="flex items-center space-x-2 mb-2">
                                        {paymentResult.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className={`font-medium ${paymentResult.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {paymentResult.success ? 'Payment Successful' : 'Payment Failed'}
                                        </span>
                                    </div>

                                    {paymentResult.success ? (
                                        <div className="space-y-1 text-sm text-green-700">
                                            <p>Amount: ${paymentResult.amount?.toFixed(2)}</p>
                                            {paymentResult.transactionHash && (
                                                <p className="font-mono text-xs">
                                                    TX: {paymentResult.transactionHash.slice(0, 10)}...
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-700">{paymentResult.error}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200">
                            {!paymentResult ? (
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1"
                                        disabled={isProcessing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={processPayment}
                                        className="flex-1"
                                        disabled={isProcessing || (selectedMethod === 'usdc' && !walletConnected)}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Receipt className="w-4 h-4 mr-2" />
                                                Pay ${amount.toFixed(2)}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <Button onClick={onClose} className="w-full">
                                    Close
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;
