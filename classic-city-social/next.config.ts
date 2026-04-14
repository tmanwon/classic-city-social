import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        //hostname: '**', // Matches all hostnames
        hostname: 's1.ticketm.net'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'image2url.com'
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co'
      }
    ],
  },
};

export default nextConfig;
