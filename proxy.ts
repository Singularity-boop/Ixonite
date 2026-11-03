import { NextResponse, type NextRequest } from "next/server";

// Strict Content-Security-Policy with a fresh nonce per request. Next.js
// reads the nonce from the request header and adds it to its own scripts,
// so no inline script runs without it. This is why pages render per request
// (see connection() in app/layout.tsx): a static page can't carry a nonce.
//
// connect-src lists the services the free tools call from the browser:
// Cloudflare DNS-over-HTTPS (email checker), Have I Been Pwned (password
// checker) and Mozilla Observatory (website checker). Add any new one here.
const CONNECT = ["https://cloudflare-dns.com", "https://api.pwnedpasswords.com", "https://observatory-api.mdn.mozilla.net"];

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Inline style attributes (React style props, GSAP) need 'unsafe-inline';
    // that is style only, scripts stay locked to the nonce.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${CONNECT.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: skip API routes, build assets and files with an extension.
      source: "/((?!api/|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
