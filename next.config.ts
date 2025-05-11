import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['frankfurt.apollo.olxcdn.com'],
    // You can add more domains here if needed
  },
  eslint: {
    ignoreDuringBuilds: true,
},
typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
