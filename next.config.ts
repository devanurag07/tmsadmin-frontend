import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'fluxv2-salon-products.s3.us-east-1.amazonaws.com',
    },
    {
      protocol: 'https',
      hostname: 'via.placeholder.com',
    },
    {
      protocol: 'https',
      hostname: 'utfs.io',
    },
    {
      protocol: 'https',
      hostname: 'i.ibb.co',
    },
  ],
  }
};

export default nextConfig;
