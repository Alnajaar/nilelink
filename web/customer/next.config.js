/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use static export for production builds
    ...(process.env.NODE_ENV === 'production' && {
        output: 'export',
        trailingSlash: true,
        images: {
            unoptimized: true,
        },
    }),
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias['@shared'] = require('path').resolve(__dirname, '../shared');
        return config;
    }
}

module.exports = nextConfig
