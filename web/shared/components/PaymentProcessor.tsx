'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from './ui/button';
import { aaService } from '../services/AccountAbstractionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Fingerprint, CheckCircle, XCircle } from 'lucide-react';

// USDC Contract on Polygon
const USDC_CONTRACT = {
  address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
  abi: [
    {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
} as const;

interface PaymentProcessorProps {
  amount: number; // Amount in USD
  recipientAddress: string; // Restaurant/supplier wallet address
  orderId: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  recipientAddress,
  orderId,
  onSuccess,
  onError,
  onCancel
}) => {
  const { address, isConnected } = useAccount();
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [processing, setProcessing] = useState(false);

  // Convert USD to USDC (assuming 1 USDC = 1 USD for simplicity)
  const usdcAmount = BigInt(Math.floor(amount * 10 ** 6)); // USDC has 6 decimals

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  React.useEffect(() => {
    if (isSuccess && hash) {
      onSuccess(hash);
    }
  }, [isSuccess, hash, onSuccess]);

  React.useEffect(() => {
    if (error) {
      onError(error.message || 'Payment failed');
    }
  }, [error, onError]);

  const handleCryptoPayment = async () => {
    if (!isConnected || !address) {
      onError('Please anchor your identity first');
      return;
    }

    setProcessing(true);
    try {
      const txHash = await aaService.execute(
        recipientAddress,
        USDC_CONTRACT.abi, // We'll pass ABI as well if the helper supports it
        'transfer',
        [recipientAddress as `0x${string}`, usdcAmount]
      );

      if (txHash) {
        onSuccess(txHash);
      } else {
        throw new Error('Settlement synchronization failed');
      }
    } catch (err: any) {
      console.error('Settlement error:', err);
      onError(err.message || 'System synchronization failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    // For now, simulate card payment
    // In production, integrate with Stripe, PayPal, etc.
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      onSuccess(mockTxHash);
    } catch (error: any) {
      onError('Card payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'crypto') {
      handleCryptoPayment();
    } else {
      handleCardPayment();
    }
  };

  if (!isConnected && paymentMethod === 'crypto') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Anchor Identity
          </CardTitle>
          <CardDescription>
            Please anchor your secure identity to proceed with instant settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              A secure identity anchor is required for instant, zero-fee digital settlement.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => setPaymentMethod('card')} className="flex-1">
              Use Payment Card
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment - Order #{orderId}
        </CardTitle>
        <CardDescription>
          Complete your payment to place the order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
        </div>

        {paymentMethod === 'crypto' && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="w-4 h-4" />
              <span className="font-medium">Instant Digital Settlement</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Sync ${amount.toFixed(2)} to finalize your order immediately
            </p>
            <p className="text-xs text-muted-foreground">
              Anchored Node: {address?.slice(0, 8)}
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Card Payment</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pay ${amount.toFixed(2)} with your credit/debit card
            </p>
          </div>
        )}

        {isPending || isConfirming ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>
              {isPending ? 'Initializing settlement...' : 'Finalizing secure sync...'}
            </span>
          </div>
        ) : isSuccess ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Settlement confirmed. Your order has been placed via secure sync.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={processing || isPending}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Pay ${amount.toFixed(2)}
            </Button>
          </div>
        )}

        {paymentMethod === 'crypto' && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setPaymentMethod('card')}
              className="text-sm"
            >
              Use standard card payment instead
            </Button>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setPaymentMethod('crypto')}
              className="text-sm"
            >
              Use instant digital settlement instead
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
