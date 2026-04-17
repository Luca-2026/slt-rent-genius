import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.slt-rental.de',
        pathname: '/assets/**',
      },
    ],
  },
}

export default nextConfig
