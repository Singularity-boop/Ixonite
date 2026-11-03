import { CONTACT_EMAIL, SITE_URL } from "../../content";

// RFC 9116 security.txt: how to report a vulnerability in our own systems.
// Built per request so Expires always stays in the future.
export const dynamic = "force-dynamic";

export function GET() {
  const expires = new Date(Date.now() + 180 * 24 * 3600 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: mailto:${CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
