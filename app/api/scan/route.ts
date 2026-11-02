import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";

// Website security checker, server side. Browsers cannot read another
// site's response headers or certificate, so this makes one request to the
// site the visitor entered and returns headers and certificate details.
//
// Safety: public hostnames only, every resolved IP must be public (no
// internal or cloud-metadata addresses), connections are pinned to the
// checked IP (no DNS rebinding), ports 80/443 only, short timeouts, the body
// is never read, and each visitor is rate limited.

export const dynamic = "force-dynamic";

const HOST_RE = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

const blocked = new net.BlockList();
for (const [addr, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(addr, prefix, "ipv4");
for (const [addr, prefix] of [["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8], ["2001:db8::", 32]] as const)
  blocked.addSubnet(addr, prefix, "ipv6");

function isPublic(ip: string) {
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
  if (mapped) return !blocked.check(mapped, "ipv4");
  return !blocked.check(ip, net.isIPv6(ip) ? "ipv6" : "ipv4");
}

async function publicIp(host: string): Promise<string | null | false> {
  try {
    const addrs = await lookup(host, { all: true });
    if (!addrs.length) return null;
    if (addrs.some((a) => !isPublic(a.address))) return false;
    return (addrs.find((a) => a.family === 4) ?? addrs[0]).address;
  } catch {
    return null;
  }
}

// ---- per-visitor rate limit: 20 scans per 10 minutes ----
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => t > now - 600_000);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 20;
}

type Head = { status: number; headers: Record<string, string> };

function fetchHead(url: URL, ip: string): Promise<Head> {
  const mod = url.protocol === "http:" ? http : https;
  return new Promise((resolve) => {
    const req = mod.request(
      {
        host: url.hostname,
        port: url.protocol === "http:" ? 80 : 443,
        path: url.pathname + url.search,
        method: "GET",
        servername: url.hostname,
        rejectUnauthorized: false,
        timeout: 8000,
        headers: { "user-agent": "Mozilla/5.0 (compatible; IxoniteSecurityCheck/1.0; +https://ixonit.com/tools/)", accept: "text/html" },
        // Pin the connection to the IP we already checked.
        lookup: ((_h: string, opts: { all?: boolean }, cb: (...a: unknown[]) => void) =>
          opts?.all
            ? cb(null, [{ address: ip, family: net.isIPv6(ip) ? 6 : 4 }])
            : cb(null, ip, net.isIPv6(ip) ? 6 : 4)) as unknown as net.LookupFunction,
      } as https.RequestOptions,
      (res) => {
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.headers)) headers[k] = Array.isArray(v) ? v.join(", ") : String(v ?? "");
        res.destroy(); // never read the body
        resolve({ status: res.statusCode ?? 0, headers });
      },
    );
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve({ status: 0, headers: {} }));
    req.end();
  });
}

function tlsInfo(host: string, ip: string) {
  return new Promise<null | Record<string, unknown>>((resolve) => {
    const socket = tls.connect({ host: ip, port: 443, servername: host, rejectUnauthorized: false, timeout: 6000 }, () => {
      const cert = socket.getPeerCertificate();
      const validTo = new Date(cert.valid_to);
      resolve({
        valid: socket.authorized,
        error: socket.authorizationError ? String(socket.authorizationError) : null,
        protocol: socket.getProtocol(),
        issuer: cert.issuer?.O ?? cert.issuer?.CN ?? null,
        subject: cert.subject?.CN ?? null,
        validTo: validTo.toISOString(),
        daysLeft: Math.floor((validTo.getTime() - Date.now()) / 86_400_000),
        san: (cert.subjectaltname ?? "").split(",").map((s) => s.trim().replace(/^DNS:/, "")).filter(Boolean).slice(0, 20),
      });
      socket.end();
    });
    socket.on("timeout", () => (socket.destroy(), resolve(null)));
    socket.on("error", () => resolve(null));
  });
}

export async function GET(request: Request) {
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(visitor)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let host = (new URL(request.url).searchParams.get("host") ?? "").trim().toLowerCase();
  host = host.replace(/^[a-z]+:\/\//, "").split(/[/?#:]/)[0].replace(/\.$/, "");
  if (!HOST_RE.test(host)) return Response.json({ ok: false, error: "invalid_host" }, { status: 400 });

  const ip = await publicIp(host);
  if (ip === null) return Response.json({ ok: false, error: "no_dns" }, { status: 400 });
  if (ip === false) return Response.json({ ok: false, error: "private_address" }, { status: 400 });

  let url = new URL(`https://${host}/`);
  let currentIp = ip;
  let res = await fetchHead(url, currentIp);
  const redirects: string[] = [];
  for (let i = 0; i < 3 && res.status >= 300 && res.status < 400 && res.headers.location; i++) {
    let next: URL;
    try {
      next = new URL(res.headers.location, url);
    } catch {
      break;
    }
    if (!["http:", "https:"].includes(next.protocol) || (next.port && !["80", "443"].includes(next.port))) break;
    const nextIp = await publicIp(next.hostname);
    if (!nextIp) break;
    redirects.push(next.toString());
    url = next;
    currentIp = nextIp;
    res = await fetchHead(url, currentIp);
  }

  const [plain, cert] = await Promise.all([fetchHead(new URL(`http://${host}/`), ip), tlsInfo(host, ip)]);
  const httpsRedirect = plain.status >= 300 && plain.status < 400 && /^https:\/\//i.test(plain.headers.location ?? "");

  return Response.json(
    {
      ok: res.status > 0,
      host,
      finalHost: url.hostname,
      status: res.status,
      redirects,
      httpsRedirect,
      headers: res.headers,
      tls: cert,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
