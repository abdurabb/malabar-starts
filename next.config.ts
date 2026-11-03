import type { NextConfig } from "next";
import { apiOrigin } from "./src/lib/apiOrigin";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    const origin = apiOrigin();
    return [
      {
        source: "/api/backend/api/v1/:path*",
        destination: `${origin}/api/v1/:path*`,
      },
      {
        source: "/api/backend/:path*",
        destination: `${origin}/api/v1/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
