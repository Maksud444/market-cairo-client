/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker deployment
  i18n,
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com'
    ],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
