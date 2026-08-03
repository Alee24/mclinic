import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mclinic.co.ke',
      },
    ],
  },
  async rewrites() {
    const apiPort = process.env.API_PORT || process.env.PORT || '7899';
    return [
      {
        source: '/api/:path*',
        destination: `http://127.0.0.1:${apiPort}/api/:path*`,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
