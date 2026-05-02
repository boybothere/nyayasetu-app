import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // This fixes the "Can't resolve 'canvas'" error for pdfjs-dist
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;