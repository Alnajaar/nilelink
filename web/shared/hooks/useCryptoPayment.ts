import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { cryptoApi } from '../utils/api';
import { BLOCKCHAIN_CONFIG } from '../utils/blockchain';

interface PaymentProgress {
  step: string;
  progress: number;
}

export function useCryptoPayment() {
  const { address, chainId, provider } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const processPayment = async (orderId: string, amount: number, restaurantAddress?: string): Promise<string> => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }

    if (chainId !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
      throw new Error('Please switch to Polygon Amoy testnet');
    }

    if (!restaurantAddress) {
      throw new Error('Restaurant wallet address is required for on-chain payments');
    }

    setIsProcessing(true);
    setProgress('Preparing NileLink Protocol transaction...');

    try {
      // Get signer from provider
      const signer = await provider.getSigner();

      // Get contract addresses
      const usdcAddress = BLOCKCHAIN_CONFIG.CONTRACT_ADDRESSES.USDC;
      const escrowAddress = BLOCKCHAIN_CONFIG.CONTRACT_ADDRESSES.ORDER_SETTLEMENT;

      // Create contract instances
      const usdcContract = new ethers.Contract(usdcAddress, BLOCKCHAIN_CONFIG.ABIS.ERC20, signer);
      const escrowContract = new ethers.Contract(escrowAddress, BLOCKCHAIN_CONFIG.ABIS.ORDER_SETTLEMENT, signer);

      // Format orderId to bytes16 (strip dashes)
      const formattedOrderId = '0x' + orderId.replace(/-/g, '');
      const requiredAmount = ethers.parseUnits(amount.toFixed(6), 6);

      // Check balance
      const balance = await usdcContract.balanceOf(address);
      if (balance < requiredAmount) {
        throw new Error(`Insufficient USDC balance. Required: ${amount}, Available: ${ethers.formatUnits(balance, 6)}`);
      }

      // 1. Create Payment Intent if it doesn't exist
      setProgress('Initializing secure payment intent...');
      try {
        const intentTx = await escrowContract.createPaymentIntent(
          formattedOrderId,
          restaurantAddress,
          address,
          requiredAmount,
          2 // Method: CRYPTO
        );
        setProgress('Waiting for intent confirmation...');
        await intentTx.wait();
      } catch (intentError: any) {
        // If order already exists, it might be a retry, so we continue if it's already processed
        if (!intentError.message.includes('AlreadyProcessed')) {
          throw intentError;
        }
      }

      // 2. Approve USDC
      setProgress('Approving USDC spending...');
      const currentAllowance = await usdcContract.allowance(address, escrowAddress);

      if (currentAllowance < requiredAmount) {
        const approveTx = await usdcContract.approve(escrowAddress, requiredAmount);
        setProgress('Waiting for approval confirmation...');
        await approveTx.wait();
      }

      // 3. Pay
      setProgress('Executing on-chain payment...');
      const payTx = await escrowContract.pay(formattedOrderId, requiredAmount);
      setProgress('Waiting for payment confirmation...');
      const receipt = await payTx.wait();

      setProgress('Payment verified on-chain!');

      // Notify backend of successful payment
      try {
        await cryptoApi.verifyPayment({
          orderId,
          txHash: receipt.hash
        });
      } catch (backendError) {
        console.warn('Backend verification failed, but payment succeeded:', backendError);
      }

      return receipt.hash;

    } catch (error: any) {
      console.error('Crypto payment error:', error);
      throw new Error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  return {
    processPayment,
    isProcessing,
    progress
  };
}