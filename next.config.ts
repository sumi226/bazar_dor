import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // for Image Optimization

   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.api-store.workers.dev",
      },
    ],
  },

};

export default nextConfig;
