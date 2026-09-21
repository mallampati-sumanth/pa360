/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*/',
        destination: 'http://localhost:8000/api/v1/:path*/',
      },
    ];
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'source');
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'source'),
    },
  },
};

module.exports = nextConfig;
