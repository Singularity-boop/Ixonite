import type { NextConfig } from "next";

// Runs as a Node.js app (Hostinger Node hosting): `npm run build` then
// `npm start`. Forms and the website scanner use the routes in app/api.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
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
