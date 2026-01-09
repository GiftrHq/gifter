/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: 'brands',
        port: '3001',
        pathname: '/api/media/file/**',
      },
    ],
  },
}

module.exports = nextConfig
