// web/pos/src/components/Web3Integration.tsx
'use client'

import React, { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { polygonAmoy } from 'wagmi/chains'
import { Button } from '@shared/components/Button'
import { Card } from '@shared/components/Card'
import { 
  Wallet, 
  LogOut, 
  AlertCircle, 
  CheckCircle, 
  ArrowRightLeft,
  Copy
} from 'lucide-react'

interface Web3IntegrationProps {
  className?: string
}

export function Web3Integration({ className = '' }: Web3IntegrationProps) {
  const { address, chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const [copied, setCopied] = useState(false)

  const isWrongNetwork = chainId !== polygonAmoy.id && isConnected

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: polygonAmoy.id })
    } catch (error) {
      console.error('Network switch error:', error)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isConnected && !isWrongNetwork) {
    return (
      <Card className={`p-6 bg-green-50 border-green-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Wallet Connected</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm text-green-700 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </code>
                <button 
                  onClick={copyAddress}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
              </div>
            </div>
          </div>
          <ConnectButton.Custom>
            {({account, chain, openAccountModal, openChainModal, openConnectModal, mounted}) => {
              return (
                <Button 
                  onClick={openAccountModal}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </Card>
    )
  }

  if (isWrongNetwork) {
    return (
      <Card className={`p-6 bg-yellow-50 border-yellow-200 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Wrong Network</h3>
            <p className="text-sm text-yellow-700">
              Please switch to Polygon Amoy testnet
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSwitchNetwork}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Switch to Polygon Amoy
        </Button>
      </Card>
    )
  }

  return (
    <Card className={`p-6 bg-gray-50 border-gray-200 ${className}`}>
      <div className="text-center mb-6">
        <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Connect Web3 Wallet
        </h3>
        <p className="text-sm text-gray-600">
          Connect your wallet to enable blockchain features
        </p>
      </div>
      
      <div className="flex justify-center mb-4">
        <ConnectButton 
          showBalance={false}
          chainStatus="none"
          label="Connect Wallet"
          className="w-full"
        />
      </div>
      
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>By connecting, you agree to our Terms of Service</p>
        <p className="mt-1">Transactions will be processed on Polygon Amoy</p>
      </div>
    </Card>
  )
}