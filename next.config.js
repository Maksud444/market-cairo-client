/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

// Internal backend URL for server-side rewrites (docker network or localhost)
const BACKEND_URL = process.env.INTERNAL_API_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
