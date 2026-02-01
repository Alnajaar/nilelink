const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable turbopack explicitly to avoid mixed config errors
    // turbopack: {},
    experimental: {
        externalDir: true,
    },
    transpilePackages: ['@shared', '@rainbow-me/rainbowkit', 'wagmi', '@tanstack/react-query'],
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        config.resolve.modules = [
            path.resolve(__dirname, 'node_modules'),
            'node_modules',
            ...(config.resolve.modules || []),
        ];

        // SQL.js needs to be handled specially for client-side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }
        // Ignore unused optional dependencies for Wagmi connectors
        config.resolve.alias = {
            ...config.resolve.alias,
            '@coinbase/wallet-sdk': false,
            '@gemini-wallet/core': false,
            '@safe-global/safe-apps-sdk': false,
            '@safe-global/safe-apps-provider': false,
            'porto': false,
            'porto/internal': false,
            '@react-native-async-storage/async-storage': false,
        };

        // Handle problematic imports more aggressively
        config.externals.push(
            'pino-pretty',
            'lokijs',
            'encoding',
            (context, request, callback) => {
                if (request.startsWith('porto')) {
                    return callback(null, '{}'); // Return empty object for problematic imports
                }
                callback();
            }
        );
        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig
