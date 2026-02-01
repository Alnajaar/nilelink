/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    serverExternalPackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias['@shared'] = require('path').resolve(__dirname, '../shared');

        // Handle problematic imports more aggressively
        config.externals = [
            ...config.externals,
            'pino-pretty',
            'lokijs',
            'encoding',
        ];

        return config;
    }
}

module.exports = nextConfig
