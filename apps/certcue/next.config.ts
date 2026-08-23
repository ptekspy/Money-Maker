import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.LETDUE_NEXT_BUILD_DIR ?? ".next",
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
