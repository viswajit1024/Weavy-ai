import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '.',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.transloadit.com' },
      { protocol: 'https', hostname: '**.clerk.dev' },
    ],
  },
};

export default nextConfig;