/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const BACKEND_URL = process.env.INTERNAL_API_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    domains: [
      'localhost',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: '*' },
      { protocol: 'http', hostname: '*' },
    ],
    // unoptimized: REMOVED — enables WebP/AVIF conversion and resizing
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
