import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
