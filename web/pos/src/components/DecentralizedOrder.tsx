// web/pos/src/components/DecentralizedOrder.tsx
'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3-config'
import { nileLinkProtocolABI } from '@/abi/NileLinkProtocol_ABI'
import { Button } from '@shared/components/Button'
import { Card } from '@shared/components/Card'
import { motion } from 'framer-motion'
import { 
  Package, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  ArrowRightLeft
} from 'lucide-react'

interface DecentralizedOrderProps {
  orderId: string
  restaurantAddress: string
  customerAddress: string
  amount: bigint
  onOrderCreated?: (success: boolean) => void
  className?: string
}

export function DecentralizedOrder({ 
  orderId, 
  restaurantAddress, 
  customerAddress, 
  amount,
  onOrderCreated,
  className = ''
}: DecentralizedOrderProps) {
  const { address: userAddress, isConnected, chain } = useAccount()
  const [orderStatus, setOrderStatus] = useState<'idle' | 'approving' | 'creating' | 'confirmed' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  const {
    data: hash,
    error,
    isPending,
    writeContract
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const handleCreateOrder = async () => {
    if (!isConnected || !userAddress) {
      alert('Please connect your wallet first')
      return
    }

    if (chain?.id !== 80002) { // Polygon Amoy chain ID
      alert('Please switch to Polygon Amoy testnet')
      return
    }

    setOrderStatus('creating')
    
    try {
      const txHash = await writeContract({
        address: CONTRACT_ADDRESSES.nileLinkProtocol,
        abi: nileLinkProtocolABI,
        functionName: 'createOrder',
        args: [orderId, restaurantAddress, customerAddress, amount],
      })
      
      setTxHash(txHash as string)
      onOrderCreated?.(true)
    } catch (err) {
      console.error('Error creating order:', err)
      setOrderStatus('error')
      onOrderCreated?.(false)
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Package className="w-6 h-6 text-pos-accent" />
        <h3 className="text-lg font-semibold">Decentralized Order</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Order ID</p>
            <p className="font-mono text-xs truncate">{orderId.slice(0, 12)}...</p>
          </div>
          <div>
            <p className="text-gray-500">Amount</p>
            <p className="font-medium">{(Number(amount) / 1000000).toFixed(2)} USDC</p>
          </div>
          <div>
            <p className="text-gray-500">Restaurant</p>
            <p className="font-mono text-xs truncate">{restaurantAddress.slice(0, 8)}...</p>
          </div>
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-mono text-xs truncate">{customerAddress.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="pt-4">
          {orderStatus === 'idle' && (
            <Button 
              onClick={handleCreateOrder}
              disabled={isPending || isConfirming}
              className="w-full bg-pos-accent hover:bg-pos-accent/90 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Create Order on Blockchain
                </>
              )}
            </Button>
          )}

          {(isPending || isConfirming) && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-800">Processing Transaction</p>
                  <p className="text-sm text-blue-600">Please confirm in your wallet</p>
                </div>
              </div>
              {hash && (
                <p className="text-xs text-gray-500 font-mono truncate">
                  TX: {hash}
                </p>
              )}
            </div>
          )}

          {isConfirmed && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Order Confirmed!</p>
                  <p className="text-sm text-green-600">Successfully created on blockchain</p>
                </div>
              </div>
              {hash && (
                <p className="text-xs text-gray-500 font-mono truncate">
                  TX: {hash}
                </p>
              )}
            </div>
          )}

          {orderStatus === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Order Failed</p>
                  <p className="text-sm text-red-600">{error?.message || 'An error occurred'}</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setOrderStatus('idle')
                  setTxHash(null)
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}