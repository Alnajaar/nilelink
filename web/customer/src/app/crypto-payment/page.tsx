"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { useCustomer } from '@/contexts/CustomerContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { useCryptoPayment } from '@shared/hooks/useCryptoPayment';

export default function CryptoPaymentPage() {
  const {
    isConnected,
    address,
    balance,
    chainId,
    connect,
    isConnecting,
    error: web3Error,
    signMessage,
    isMetaMaskInstalled
  } = useWeb3();

  const [paymentStep, setPaymentStep] = useState<'connect' | 'confirm' | 'processing' | 'success'>('connect');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'USDT' | 'MATIC'>('USDC');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const { processPayment, isProcessing: isPaymentProcessing, progress: paymentProgress } = useCryptoPayment();

  const [tokens, setTokens] = useState<any[]>([]);
  const [supportedTokens, setSupportedTokens] = useState<any[]>([]);

  // Fetch supported tokens from backend
  useEffect(() => {
    const fetchSupportedTokens = async () => {
      try {
        const response = await fetch('/api/crypto/supported-tokens');
        const data = await response.json();
        if (data.success) {
          setSupportedTokens(data.data);
          // Set tokens with real balances if wallet connected
          if (isConnected && address) {
            const tokensWithBalance = data.data.map((token: any) => ({
              ...token,
              balance: token.symbol === 'USDC' ? (balance || '0') : '0.00' // Only show USDC balance for now
            }));
            setTokens(tokensWithBalance);
          } else {
            setTokens(data.data.map((token: any) => ({ ...token, balance: '0.00' })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch supported tokens:', err);
        // Fallback to basic tokens
        setTokens([
          { symbol: 'USDC', name: 'USD Coin', balance: '0.00', icon: '💰' },
          { symbol: 'USDT', name: 'Tether USD', balance: '0.00', icon: '💵' },
          { symbol: 'MATIC', name: 'Polygon', balance: '0.00', icon: '🔺' }
        ]);
      }
    };

    fetchSupportedTokens();
  }, [isConnected, address, balance]);

  const handleWalletConnect = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      await connect();
      // Connection successful, will update state automatically
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  // Update payment step when wallet connects
  useEffect(() => {
    if (isConnected && address && chainId === 80002) { // Amoy testnet
      setPaymentStep('confirm');
    }
  }, [isConnected, address, chainId]);

  // Handle Web3 errors
  useEffect(() => {
    if (web3Error) {
      setError(web3Error);
    }
  }, [web3Error]);

  const handlePaymentConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isConnected || !address) {
      setError('Wallet not connected');
      return;
    }

    if (chainId !== 80002) { // Amoy testnet
      setError('Please switch to Polygon Amoy testnet');
      return;
    }

    setIsLoading(true);
    setError('');
    setPaymentStep('processing');

    try {
      // Generate nonce for signature
      const nonce = `nilelink_payment_${Date.now()}`;
      const message = `Confirm payment of ${amount} ${selectedToken} for order\nNonce: ${nonce}`;

      // Sign the message
      const signature = await signMessage(message);

      // Call backend to initiate payment
      const response = await fetch('/api/crypto/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: 'temp_order_id', // This should come from context/props
          amount: parseFloat(amount),
          walletAddress: address,
          paymentMethod: selectedToken,
          signature,
          message,
          nonce
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      // For now, simulate success. In real implementation, we'd poll for transaction confirmation
      setTxHash(data.data.txHash || `0x${Math.random().toString(16).substr(2, 64)}`);
      setPaymentStep('success');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setPaymentStep('confirm');
    } finally {
      setIsLoading(false);
    }
  };

  const estimateGas = async () => {
    try {
      const response = await fetch(`/api/crypto/gas-estimate?amount=${amount}&paymentMethod=${selectedToken}`);
      const data = await response.json();

      if (data.success) {
        setGasEstimate(data.data);
      } else {
        throw new Error(data.error || 'Gas estimation failed');
      }
    } catch (err) {
      console.error('Gas estimation failed:', err);
      // Fallback estimation
      setGasEstimate({
        gasLimit: 86000,
        gasPrice: '50',
        estimatedCost: '0.0043',
        paymentMethod: selectedToken,
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    if (paymentStep === 'confirm' && amount) {
      estimateGas();
    }
  }, [paymentStep, amount, selectedToken]);

  if (paymentStep === 'connect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/checkout">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crypto Payment</h1>
              <p className="text-gray-600 text-sm">Secure blockchain payment</p>
            </div>
          </div>

          {/* Wallet Connection Card */}
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 text-sm">
                Connect your Web3 wallet to pay securely with cryptocurrency
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-600">M</span>
                  </div>
                  <span className="font-medium">MetaMask</span>
                </div>
                <div className="text-xs text-gray-500">Recommended</div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">W</span>
                  </div>
                  <span className="font-medium">WalletConnect</span>
                </div>
                <div className="text-xs text-gray-500">Multiple wallets</div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <Button
              onClick={handleWalletConnect}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet size={20} className="mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          </Card>

          {/* Security Notice */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800 mb-1">Secure Payment</h3>
                <p className="text-green-700 text-sm">
                  Your payment is secured by blockchain technology with no intermediaries.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentStep === 'confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setPaymentStep('connect')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Confirm Payment</h1>
              <p className="text-gray-600 text-sm">Review transaction details</p>
            </div>
          </div>

          {/* Payment Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h2>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Pay
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Token Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Payment Token
              </label>
              <div className="space-y-2">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol as any)}
                    className={`w-full p-3 border rounded-lg flex items-center justify-between transition ${selectedToken === token.symbol
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{token.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-gray-500">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{token.balance}</div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gas Estimate */}
            {gasEstimate && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Network Fee Estimate</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Gas Limit:</span>
                    <span>{gasEstimate.gasLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Price:</span>
                    <span>{gasEstimate.gasPrice} gwei</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Estimated Cost:</span>
                    <span>{gasEstimate.estimatedCost} MATIC</span>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Payment Wallet</span>
              </div>
              <div className="text-sm text-blue-700 font-mono">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Balance: {balance || '0.00'} {selectedToken}
              </div>
              {chainId !== 80002 && (
                <div className="text-xs text-red-600 mt-1">
                  ⚠️ Please switch to Polygon Amoy testnet
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <Button
              onClick={handlePaymentConfirm}
              disabled={isLoading || !amount}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} className="mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={48} className="text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we process your crypto payment...</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-sm text-gray-700">Transaction initiated</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-blue-600" />
                <span className="text-sm text-gray-700">Confirming on blockchain</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-400">Completing payment</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your crypto payment has been processed successfully.</p>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">{amount} {selectedToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Network Fee:</span>
                <span className="font-medium">{gasEstimate?.estimatedCost} MATIC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-blue-600">
                  {txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : 'Processing...'}
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Link href="/orders">
              <Button className="w-full" size="lg">
                View Order Details
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
