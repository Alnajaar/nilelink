/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use static export for production builds
    ...(process.env.NODE_ENV === 'production' && {
        output: 'standalone',
        // trailingSlash: true, // Typically not needed for SSR/Standalone unless specific routing requirements
        images: {
            unoptimized: true, // Keep this if using external loader or if optimization not needed yet
        },
        generateBuildId: async () => {
            return 'build-' + Date.now()
        },
    }),
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },


    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');

        // Add alias for @shared
        config.resolve.alias['@shared'] = require('path').resolve(__dirname, '../shared');

        return config;
    },
}

module.exports = nextConfig
