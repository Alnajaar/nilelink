const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    images: {
        unoptimized: true,
    },
    transpilePackages: ['@shared'],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        externalDir: true,
    },
}

module.exports = nextConfig
