# NileLink Mobile Apps

This directory contains the React Native (Expo) mobile applications for the NileLink ecosystem.

## Apps

- **Customer App**: Browse restaurants, place orders, track deliveries
- **Driver App**: Accept delivery jobs, navigate routes, manage earnings
- **Merchant App**: POS terminal mobile companion (future)

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State**: Shared contexts from web ecosystem
- **Styling**: NativeWind (Tailwind for React Native)

## Setup

```bash
# Install dependencies
cd mobile
npm install

# Run on iOS
npm run ios

# Run on Android
npm run android

# Web preview
npm run web
```

## Shared Code Strategy

The mobile apps reuse:
- API utilities (`web/shared/utils/api.ts`)
- Type definitions (future `@nilelink/types` package)
- Socket.IO client (`web/shared/utils/socket.ts`)

## Development

Mobile-first UI components are in `/components` with touch-optimized interfaces.
