/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig