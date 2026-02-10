/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'resources.cryptocompare.com',
            },
            {
                protocol: 'https',
                hostname: 'images.cryptocompare.com',
            },
            {
                protocol: 'https',
                hostname: 'coin-images.coingecko.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'api.qrserver.com',
            },
            {
                protocol: 'https',
                hostname: 'randomuser.me',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            }
        ],
    },
};

module.exports = nextConfig;
