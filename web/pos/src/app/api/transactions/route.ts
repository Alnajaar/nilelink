import { NextRequest, NextResponse } from 'next/server';
import { getPublicClient, getWalletClient } from '@wagmi/core';
import { parseUnits } from 'viem';
import { config } from '@/lib/wagmi';
import NileLinkProtocolAbi from '@/lib/abis/NileLinkProtocol.json';

/**
 * Transaction Processing API Route
 * 
 * Handles blockchain transaction processing for POS orders
 * This endpoint validates orders and executes payments on-chain
 * 
 * @route POST /api/transactions
 */
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    const { orderId, restaurantAddress, customerAddress, amount, paymentMethod } = requestData;

    // Validate required fields
    if (!orderId || !restaurantAddress || !customerAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, restaurantAddress, customerAddress, amount' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!isValidAddress(restaurantAddress) || !isValidAddress(customerAddress)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get protocol contract address from environment
    const protocolAddress = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS;
    if (!protocolAddress || protocolAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Protocol contract address not configured' },
        { status: 500 }
      );
    }

    // Get wallet client
    // Note: In a real implementation, this would use the authenticated user's wallet
    // For now, we'll return the transaction data that would be signed by the client
    
    // Convert amount to USDC units (6 decimals)
    const amountUsd6 = parseUnits(amount.toString(), 6);

    // Generate bytes16 orderId from the string
    const orderIdBytes16 = slice(keccak256(orderId), 0, 16) as `0x${string}`;

    // Prepare transaction data
    const transactionData = {
      address: protocolAddress as `0x${string}`,
      abi: NileLinkProtocolAbi.abi,
      functionName: 'createAndPayOrder',
      args: [
        orderIdBytes16,
        restaurantAddress as `0x${string}`,
        customerAddress as `0x${string}`,
        amountUsd6,
        paymentMethod || 2 // Default to PaymentMethod.CRYPTO (2)
      ],
      account: customerAddress as `0x${string}`,
    };

    // Return transaction data for client-side signing
    return NextResponse.json({
      success: true,
      orderId,
      transactionData,
      estimatedGas: 'estimate_not_available', // Would be calculated in a real implementation
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Transaction processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during transaction processing' },
      { status: 500 }
    );
  }
}

/**
 * Transaction Status Check API Route
 * 
 * Checks the status of a blockchain transaction
 * 
 * @route GET /api/transactions/[txHash]
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get('txHash');

  if (!txHash) {
    return NextResponse.json(
      { error: 'Transaction hash is required' },
      { status: 400 }
    );
  }

  try {
    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }

    // Get public client to check transaction status
    const publicClient = getPublicClient(config);
    
    // Check if transaction exists and get receipt
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
    } catch (error) {
      // Transaction might not be mined yet
      const transaction = await publicClient.getTransaction({
        hash: txHash as `0x${string}`,
      });
      
      return NextResponse.json({
        txHash,
        status: 'pending',
        transaction: {
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: transaction.value?.toString(),
          nonce: transaction.nonce,
          gasPrice: transaction.gasPrice?.toString(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (receipt) {
      return NextResponse.json({
        txHash,
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        blockHash: receipt.blockHash,
        cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs.map(log => ({
          address: log.address,
          topics: log.topics,
          data: log.data,
        })),
        timestamp: new Date().toISOString(),
      });
    } else {
      // Transaction not found
      return NextResponse.json({
        txHash,
        status: 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Transaction status check error:', error);
    return NextResponse.json(
      { error: 'Error checking transaction status' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to validate Ethereum address format
 */
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}