import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/CivicPulseAI",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;