import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have TypeScript definitions
import withPWA from 'next-pwa';

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
  /* config options here */
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);



