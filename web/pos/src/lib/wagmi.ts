import { http, createConfig } from 'wagmi'
import { polygon, polygonAmoy } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [polygonAmoy, polygon],
  connectors: [
    coinbaseWallet({
      appName: 'NileLink POS',
      appLogoUrl: 'https://nilelink.com/logo.png',
    }),
    // Temporarily disable WalletConnect to prevent unauthorized WebSocket errors
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id' }),
  ],
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
