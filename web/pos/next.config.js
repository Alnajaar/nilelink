const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
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
            '@metamask/sdk': false,
            '@safe-global/safe-apps-sdk': false,
            '@safe-global/safe-apps-provider': false,
            'porto': false,
        };
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
    transpilePackages: ['@shared'],
    experimental: {
        externalDir: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

}

module.exports = nextConfig
