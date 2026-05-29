import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  turbopack: {},
  transpilePackages: ["mapbox-gl"],
};

export default nextConfig;
