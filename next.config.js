/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase API route timeout for async image generation
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Output configuration for App Platform
  output: 'standalone',
}

module.exports = nextConfig

