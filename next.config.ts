import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
};

export default nextConfig;
