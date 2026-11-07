import type { NextConfig } from "next";

// Runs as a Node.js app (Hostinger Node hosting): `npm run build` then
// `npm start`. Forms and the website scanner use the routes in app/api.

// Security headers for every response. The page Content-Security-Policy is
// set per request in proxy.ts, because it carries a nonce.
const securityHeaders = [
  // HTTPS only for two years. Add "; includeSubDomains" once every
  // subdomain of ixonit.com is served over HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // API responses are JSON, never pages: allow nothing.
      { source: "/api/:path*", headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" }] },
    ];
  },
  async redirects() {
    // The old location some scanners still check.
    return [{ source: "/security.txt", destination: "/.well-known/security.txt", permanent: true }];
  },
};

export default nextConfig;
