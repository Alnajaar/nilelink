/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // For static deployment to Cloudflare Pages
    images: {
        unoptimized: true,
    },
    transpilePackages: ['@shared'],
    experimental: {
        externalDir: true,
    },
}

module.exports = nextConfig
