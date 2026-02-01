// web/pos/src/lib/web3-config.ts
import { createConfig, http } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'
import { metaMask, walletConnect } from '@wagmi/connectors'

// NileLink Protocol Contract Addresses (from deployment)
export const CONTRACT_ADDRESSES = {
  nileLinkProtocol: process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_CONTRACT || '0x98Dc3Ae669ae676fA261C38951C5dC01dB4d5768',
  restaurantRegistry: process.env.NEXT_PUBLIC_RESTAURANT_REGISTRY_CONTRACT || '0x38D57dc538f4009452c3979a99256892EDa4dC9C',
  orderSettlement: process.env.NEXT_PUBLIC_ORDER_SETTLEMENT_CONTRACT || '0x719F8A5f9700657dA090abABdF1c9F740491CCb9',
  currencyExchange: process.env.NEXT_PUBLIC_CURRENCY_EXCHANGE_CONTRACT || '0x2B9649De5f9E3050cAc4494FA5c06027EA7f05f7',
  supplierRegistry: process.env.NEXT_PUBLIC_SUPPLIER_REGISTRY_CONTRACT || '0x974612B35e3d67361C33C5faC96E0F499980F36f',
  deliveryCoordinator: process.env.NEXT_PUBLIC_DELIVERY_COORDINATOR_CONTRACT || '0x496589A5E1b9f6A9550aDCaaa5164f0dc7F92814',
  // Add other contract addresses as needed
}

// Wagmi configuration for POS system
export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    }),
  ],
  transports: {
    [polygonAmoy.id]: http(
      process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology'
    ),
  },
})

// Network configuration
export const NETWORK_CONFIG = {
  chainId: polygonAmoy.id,
  name: 'Polygon Amoy',
  currency: 'MATIC',
  explorer: 'https://amoy.polygonscan.com',
  rpcUrl: process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
}

// Contract ABIs (simplified for now)
export const CONTRACT_ABIS = {
  NileLinkProtocol: [
    // Main protocol functions
    'function createAndPayOrder(bytes16 orderId, address restaurant, address customer, uint256 amountUsd6, uint8 method) external returns (bool)',
    'function createOrder(bytes32 orderId, address restaurant, address customer, uint256 amount) external',
    'function getOrderStatus(bytes16 orderId) external view returns (uint8)',
    'function getProtocolFee() external view returns (uint16)',
    // Add more ABI functions as needed
  ],
  RestaurantRegistry: [
    'function registerRestaurant(address owner, string name, string location) external',
    'function isRestaurantRegistered(address restaurant) external view returns (bool)',
    'function getRestaurantInfo(address restaurant) external view returns (string name, string location, bool active)',
  ],
  OrderSettlement: [
    'function createPaymentIntent(bytes16 orderId, address restaurant, address customer, uint256 amount) external',
    'function completeOrder(bytes16 orderId) external',
    'function refundOrder(bytes16 orderId) external',
    'function getOrderDetails(bytes16 orderId) external view returns (address restaurant, address customer, uint256 amount, uint8 status)',
  ],
}

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export const formatCurrency = (amount: bigint, decimals: number = 6): string => {
  const formatted = Number(amount) / Math.pow(10, decimals)
  return formatted.toFixed(2)
}

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}