import { useState, useEffect } from 'react';
import web3Service from '../services/Web3Service';
import { useWallet } from '../contexts/WalletContext';

export interface OrderData {
  restaurantId: string;
  items: any[];
  totalAmount: string;
  deliveryAddress?: string;
}

export interface PaymentData {
  orderId: string;
  amount: string;
  tokenAddress: string;
}

export const useContractInteractions = () => {
  const { wallet } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      setIsInitialized(true);
    }
  }, [wallet]);

  const createOrder = async (orderData: OrderData) => {
    if (!isInitialized) {
      throw new Error('Wallet not connected or not initialized');
    }
    return await web3Service.createOrder(orderData);
  };

  const processPayment = async (paymentData: PaymentData) => {
    if (!isInitialized) {
      throw new Error('Wallet not connected or not initialized');
    }
    return await web3Service.processPayment(paymentData);
  };

  const getUserRestaurants = async (userAddress: string) => {
    return await web3Service.getUserRestaurants(userAddress);
  };

  const getExchangeRates = async () => {
    return await web3Service.getExchangeRates();
  };

  const getTransactionStatus = async (txHash: string) => {
    return await web3Service.getTransactionStatus(txHash);
  };

  const getUserRole = async (address: string) => {
    return await web3Service.getUserRole(address);
  };

  const anchorEventBatch = async (subject: string, cid: string) => {
    if (!isInitialized) {
      throw new Error('Wallet not connected or not initialized');
    }
    return await web3Service.anchorEventBatch(subject, cid);
  };

  const pickUpOrder = async (orderId: string) => {
    if (!isInitialized) {
      throw new Error('Wallet not connected or not initialized');
    }
    return await web3Service.pickUpOrder(orderId);
  };

  const completeDelivery = async (orderId: string, proofHash?: string) => {
    if (!isInitialized) {
      throw new Error('Wallet not connected or not initialized');
    }
    return await web3Service.completeDelivery(orderId, proofHash);
  };

  return {
    createOrder,
    processPayment,
    getUserRestaurants,
    getExchangeRates,
    getTransactionStatus,
    getUserRole,
    anchorEventBatch,
    pickUpOrder,
    completeDelivery,
    isInitialized
  };
};