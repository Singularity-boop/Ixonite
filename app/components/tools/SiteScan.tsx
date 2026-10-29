"use client";

import { useState } from "react";
import { ArrowRight } from "../icons";
import { cleanDomain } from "./EmailSecurity";
import ResultsGate from "./ResultsGate";
import { ResultList, type Check, type ToolResult } from "./results";

type Scan = {
  ok: boolean;
  error?: string;
  host: string;
  finalHost: string;
  status: number;
  redirects: string[];
  httpsRedirect: boolean;
  headers: Record<string, string>;
  tls: null | {
    valid: boolean;
    protocol: string | null;
    issuer: string | null;
    subject: string | null;
    validTo: string;
    daysLeft: number;
    san: string[];
  };
};

type Observatory = { grade?: string; score?: number; details_url?: string; error?: string | null };

export function analyseHeaders(h: Record<string, string>): Check[] {
  const checks: Check[] = [];
  const hsts = h["strict-transport-security"];
  const maxAge = Number(hsts?.match(/max-age=(\d+)/i)?.[1] ?? 0);
  checks.push(
    !hsts
      ? { label: "Strict-Transport-Security (HSTS)", status: "fail", detail: "Browsers are not told to always use HTTPS, so the first visit can be downgraded and intercepted.", fix: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains" }
      : maxAge < 15552000
        ? { label: "Strict-Transport-Security (HSTS)", status: "warn", detail: `HSTS is set but max-age is only ${maxAge} seconds.`, value: hsts, fix: "Use max-age of at least 15552000 (180 days), ideally 31536000." }
        : { label: "Strict-Transport-Security (HSTS)", status: "pass", detail: "Browsers will only connect over HTTPS.", value: hsts },
  );
  const csp = h["content-security-policy"];
  checks.push(
    !csp
      ? { label: "Content-Security-Policy", status: "fail", detail: "No CSP. If an attacker finds an XSS bug, nothing limits what their script can do.", fix: "Start with: Content-Security-Policy: default-src 'self'; object-src 'none'; frame-ancestors 'self' and tighten from there." }
      : /unsafe-inline|unsafe-eval|\*/.test(csp)
        ? { label: "Content-Security-Policy", status: "warn", detail: "A CSP is set but allows unsafe-inline, unsafe-eval or wildcards, which weakens XSS protection.", value: csp.slice(0, 300), fix: "Replace unsafe-inline with nonces or hashes and remove wildcards." }
        : { label: "Content-Security-Policy", status: "pass", detail: "A CSP limits where scripts and other content can load from.", value: csp.slice(0, 300) },
  );
  const xfo = h["x-frame-options"];
  checks.push(
    xfo || /frame-ancestors/i.test(csp ?? "")
      ? { label: "Clickjacking protection", status: "pass", detail: "Other sites cannot load this page in a hidden frame.", value: xfo ? `X-Frame-Options: ${xfo}` : "CSP frame-ancestors" }
      : { label: "Clickjacking protection", status: "fail", detail: "The page can be framed by any site, which allows clickjacking attacks.", fix: "Add X-Frame-Options: SAMEORIGIN or CSP frame-ancestors 'self'." },
  );
  checks.push(
    /nosniff/i.test(h["x-content-type-options"] ?? "")
      ? { label: "X-Content-Type-Options", status: "pass", detail: "Browsers will not guess content types." }
      : { label: "X-Content-Type-Options", status: "warn", detail: "Browsers may guess file types, which can turn uploads into scripts.", fix: "Add X-Content-Type-Options: nosniff" },
  );
  checks.push(
    h["referrer-policy"]
      ? { label: "Referrer-Policy", status: "pass", detail: "Controls what URL information is shared with other sites.", value: h["referrer-policy"] }
      : { label: "Referrer-Policy", status: "warn", detail: "Full URLs, including any tokens in them, may be sent to other sites.", fix: "Add Referrer-Policy: strict-origin-when-cross-origin" },
  );
  checks.push(
    h["permissions-policy"]
      ? { label: "Permissions-Policy", status: "pass", detail: "Limits which browser features (camera, location…) the page can use." }
      : { label: "Permissions-Policy", status: "info", detail: "No Permissions-Policy. Optional, but useful to switch off features you don't use.", fix: "Add Permissions-Policy: camera=(), microphone=(), geolocation=()" },
  );
  const leaks = ["server", "x-powered-by", "x-aspnet-version", "x-aspnetmvc-version"].filter((k) => h[k] && /\d/.test(h[k]));
  if (leaks.length) {
    checks.push({ label: "Version disclosure", status: "warn", detail: "Headers reveal software versions, which helps attackers pick known exploits.", value: leaks.map((k) => `${k}: ${h[k]}`).join("\n"), fix: "Remove version numbers from these headers." });
  }
  const cookies = h["set-cookie"];
  if (cookies && (!/secure/i.test(cookies) || !/httponly/i.test(cookies))) {
    checks.push({ label: "Cookie flags", status: "warn", detail: "Cookies are set without Secure and/or HttpOnly, so they may leak over HTTP or be read by scripts.", fix: "Set Secure; HttpOnly; SameSite=Lax on session cookies." });
  }
  return checks;
}

function grade(checks: Check[]) {
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const pts = Math.max(0, 100 - fails * 20 - warns * 7);
  return pts >= 90 ? "A" : pts >= 75 ? "B" : pts >= 60 ? "C" : pts >= 45 ? "D" : "F";
}

export default function SiteScan() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [obsUrl, setObsUrl] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const host = cleanDomain(input);
    if (!host) {
      setError("Enter a website like example.com.");
      setState("error");
      return;
    }
    setState("loading");
    setResult(null);

    const [scan, obs] = await Promise.all([
      fetch(`/scan.php?host=${encodeURIComponent(host)}`)
        .then(async (r) => (r.headers.get("content-type")?.includes("json") ? ((await r.json()) as Scan) : null))
        .catch(() => null),
      fetch(`https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${encodeURIComponent(host)}`, { method: "POST" })
        .then((r) => r.json() as Promise<Observatory>)
        .catch(() => null),
    ]);

    if (scan && !scan.ok && scan.error) {
      const msg: Record<string, string> = {
        invalid_host: "That doesn't look like a valid website address.",
        no_dns: "We couldn't find that domain in DNS. Check the spelling.",
        private_address: "That address points to a private network, so we can't check it.",
        rate_limited: "Too many checks from your connection. Try again in a few minutes.",
      };
      setError(msg[scan.error] ?? "We couldn't reach that website.");
      setState("error");
      return;
    }

    const checks: Check[] = [];
    if (scan?.ok) {
      checks.push(
        scan.httpsRedirect
          ? { label: "HTTP to HTTPS redirect", status: "pass", detail: "Visitors who type http:// are sent to the secure site." }
          : { label: "HTTP to HTTPS redirect", status: "fail", detail: "The plain http:// site does not redirect to https://.", fix: "Redirect all http:// requests to https:// with a 301." },
      );
      const t = scan.tls;
      if (!t) {
        checks.push({ label: "SSL/TLS certificate", status: "fail", detail: "We couldn't make an HTTPS connection to this site." });
      } else {
        checks.push(
          !t.valid
            ? { label: "SSL/TLS certificate", status: "fail", detail: "The certificate is not trusted for this name (self-signed, wrong hostname or broken chain). Browsers show a warning.", value: `Issued to ${t.subject ?? "?"} by ${t.issuer ?? "?"}`, fix: "Install a valid certificate covering this hostname, for example free from Let's Encrypt." }
            : t.daysLeft < 0
              ? { label: "SSL/TLS certificate", status: "fail", detail: "The certificate has expired.", fix: "Renew it now and turn on automatic renewal." }
              : t.daysLeft < 14
                ? { label: "SSL/TLS certificate", status: "warn", detail: `Valid, but expires in ${t.daysLeft} days (${new Date(t.validTo).toDateString()}).`, value: `Issued by ${t.issuer}`, fix: "Check automatic renewal is working." }
                : { label: "SSL/TLS certificate", status: "pass", detail: `Valid and trusted, expires in ${t.daysLeft} days (${new Date(t.validTo).toDateString()}).`, value: `Issued by ${t.issuer}` },
        );
        if (t.protocol) {
          checks.push(
            /TLSv1(\.[01])?$/.test(t.protocol)
              ? { label: "TLS version", status: "fail", detail: `The server negotiated ${t.protocol}, which is outdated and insecure.`, fix: "Disable TLS 1.0 and 1.1; allow only TLS 1.2 and 1.3." }
              : { label: "TLS version", status: "pass", detail: `Connected with ${t.protocol}.` },
          );
        }
      }
      checks.push(...analyseHeaders(scan.headers));
    }

    const ownGrade = scan?.ok ? grade(checks) : undefined;
    const obsGrade = obs && !obs.error ? obs.grade : undefined;
    if (obsGrade) {
      checks.push({ label: "Mozilla Observatory", status: "info", detail: `Mozilla's independent scanner grades this site ${obsGrade} (score ${obs?.score}).` });
      setObsUrl(obs?.details_url ?? "");
    }
    if (!checks.length) {
      setError("We couldn't reach that website. Check the address and try again.");
      setState("error");
      return;
    }

    setResult({
      tool: "Website security check",
      target: scan?.finalHost && scan.finalHost !== host ? `${host} → ${scan.finalHost}` : host,
      grade: ownGrade ?? obsGrade,
      summary: !scan?.ok
        ? "Only Mozilla Observatory's grade is available for this site right now; the detailed header and certificate check didn't respond. Try again in a minute."
        : checks.some((c) => c.status === "fail")
          ? "This site is missing protections that browsers can enforce for free. Each fix below is a small configuration change."
          : "The basics are in place. Headers can't catch logic or access control bugs, which is where real breaches happen.",
      checks,
    });
    setState("idle");
  }

  return (
    <div className="tool">
      <form className="tool-form" onSubmit={onSubmit} noValidate>
        <label className="lbl" htmlFor="t-site">
          Website
        </label>
        <div className="intake-row">
          <input
            id="t-site"
            className="input"
            placeholder="example.com"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={state === "error" ? "t-err" : undefined}
          />
          <button className="btn btn-primary" type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Scanning…" : "Scan website"} <ArrowRight />
          </button>
        </div>
        {state === "error" && (
          <p id="t-err" className="err" role="alert">
            {error}
          </p>
        )}
        {state === "loading" && <p className="form-msg">This takes up to 20 seconds.</p>}
      </form>
      {result && (
        <>
          <ResultList result={result} />
          {obsUrl && (
            <p className="form-msg">
              <a href={obsUrl} target="_blank" rel="noopener noreferrer">
                See Mozilla Observatory&apos;s full report
              </a>
            </p>
          )}
          <ResultsGate result={result} />
        </>
      )}
    </div>
  );
}
