import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "**",
      },
    ],
  },
  reactStrictMode: false,
  distDir: "build",
  eslint: {
    ignoreDuringBuilds: true, // ✅ ปิด ESLint ตอน build
  },
};

export default nextConfig;
