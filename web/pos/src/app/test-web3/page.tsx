// web/pos/src/app/test-web3/page.tsx
'use client'

import React from 'react'
import { Web3Integration } from '@/components/Web3Integration'
import { DecentralizedOrder } from '@/components/DecentralizedOrder'
import { IPFSTestComponent } from '@/components/IPFSTestComponent'
import { Card } from '@shared/components/Card'
import { Button } from '@shared/components/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestWeb3Page() {
  // Mock order data for testing
  const mockOrderId = '0x1234567890abcdef1234567890abcdef'
  const mockRestaurant = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  const mockCustomer = '0x95cED938F7991cd3e9389e763F9B07a8C39b3bFf'
  const mockAmount = BigInt(1000000) // 1 USDC (6 decimals)

  return (
    <div className="min-h-screen bg-[#02050a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Web3 Integration Test</h1>
            <p className="text-gray-400">Test the decentralized commerce features</p>
          </div>

          {/* Wallet Connection Test */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">1. Wallet Connection</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to enable blockchain features</p>
            <Web3Integration />
          </Card>

          {/* Order Creation Test */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">2. Decentralized Order Creation</h2>
            <p className="text-gray-400 mb-6">Create an order on the blockchain (requires connected wallet)</p>
            <DecentralizedOrder
              orderId={mockOrderId}
              restaurantAddress={mockRestaurant}
              customerAddress={mockCustomer}
              amount={mockAmount}
              onOrderCreated={(success) => {
                console.log('Order creation result:', success)
              }}
            />
          </Card>

          {/* IPFS Integration Test */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">3. IPFS File Storage</h2>
            <p className="text-gray-400 mb-6">Test decentralized file storage with IPFS and Pinata</p>
            <IPFSTestComponent />
          </Card>

          {/* Contract Information */}
          <Card className="p-6 bg-blue-900/20 border-blue-500/30">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Deployment Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="font-mono">Polygon Amoy Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol Contract:</span>
                <span className="font-mono text-xs">0x98Dc3Ae669ae676fA261C38951C5dC01dB4d5768</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Settlement:</span>
                <span className="font-mono text-xs">0x719F8A5f9700657dA090abABdF1c9F740491CCb9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Restaurant Registry:</span>
                <span className="font-mono text-xs">0x38D57dc538f4009452c3979a99256892EDa4dC9C</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}