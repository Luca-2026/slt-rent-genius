import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
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
