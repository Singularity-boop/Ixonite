"use client";

import { useMemo, useState } from "react";
import { ResultList, type Check, type ToolResult } from "./results";

function b64urlJson(part: string) {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

const SENSITIVE = /pass(word)?|secret|ssn|card|cvv|iban|private|api[_-]?key|token/i;

function analyse(token: string) {
  const parts = token.trim().split(".");
  if (parts.length < 2 || parts.length > 3) throw new Error("A JWT has three parts separated by dots.");
  const header = b64urlJson(parts[0]);
  const payload = b64urlJson(parts[1]);
  const checks: Check[] = [];
  const alg = String(header.alg ?? "");
  const now = Math.floor(Date.now() / 1000);

  if (!alg || alg.toLowerCase() === "none") {
    checks.push({ label: "Algorithm", status: "fail", detail: "alg is 'none': the token is unsigned. A server that accepts it lets anyone forge tokens.", fix: "Reject alg none on the server and pin the expected algorithm." });
  } else if (/^HS/.test(alg)) {
    checks.push({ label: "Algorithm", status: "warn", detail: `${alg} uses a shared secret. Weak secrets can be brute-forced offline from any captured token.`, fix: "Use a random secret of at least 32 bytes, or switch to RS256/ES256 if several services verify tokens." });
  } else {
    checks.push({ label: "Algorithm", status: "pass", detail: `${alg} uses a public/private key pair.`, fix: undefined });
  }
  if (header.jku || header.x5u || header.jwk) {
    checks.push({ label: "Key location in header", status: "warn", detail: "The header tells the server where to find the key (jku, x5u or jwk). If the server trusts it, attackers can supply their own key.", fix: "Ignore key URLs from the token; load keys only from your own configuration." });
  }
  if (typeof payload.exp !== "number") {
    checks.push({ label: "Expiry (exp)", status: "fail", detail: "No expiry. A stolen token works forever.", fix: "Set exp, ideally 15–60 minutes for access tokens." });
  } else if (payload.exp < now) {
    checks.push({ label: "Expiry (exp)", status: "info", detail: `Expired ${new Date(payload.exp * 1000).toUTCString()}.` });
  } else {
    const hours = (payload.exp - (typeof payload.iat === "number" ? payload.iat : now)) / 3600;
    checks.push(
      hours > 24
        ? { label: "Expiry (exp)", status: "warn", detail: `Valid for about ${Math.round(hours)} hours, until ${new Date(payload.exp * 1000).toUTCString()}. Long-lived tokens give stolen sessions a long life.`, fix: "Use short-lived access tokens with refresh tokens." }
        : { label: "Expiry (exp)", status: "pass", detail: `Expires ${new Date(payload.exp * 1000).toUTCString()}.` },
    );
  }
  if (!payload.aud) checks.push({ label: "Audience (aud)", status: "warn", detail: "No audience claim, so a token issued for one service may be accepted by another.", fix: "Set aud and check it on every service." });
  const leaked = Object.keys(payload).filter((k) => SENSITIVE.test(k));
  if (leaked.length) checks.push({ label: "Sensitive data", status: "fail", detail: `The payload contains ${leaked.join(", ")}. Anyone holding the token can read it; JWTs are encoded, not encrypted.`, fix: "Remove secrets and personal data from the payload." });
  if (parts.length === 2 || !parts[2]) checks.push({ label: "Signature", status: "fail", detail: "The token has no signature part." });

  const result: ToolResult = {
    tool: "JWT decoder",
    target: `${alg || "unknown"} token${payload.sub ? ` for ${String(payload.sub)}` : ""}`,
    summary: checks.some((c) => c.status === "fail") ? "This token has problems an attacker could use." : "No obvious problems in the token itself. The server's verification still needs testing.",
    checks,
  };
  return { header, payload, result };
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const out = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { ok: true as const, ...analyse(token) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error && e.message.startsWith("A JWT") ? e.message : "This doesn't decode as a JWT. Check you pasted the whole token." };
    }
  }, [token]);

  return (
    <div className="tool">
      <div className="tool-form">
        <label className="lbl" htmlFor="t-jwt">
          Token
        </label>
        <textarea
          id="t-jwt"
          className="textarea typed"
          spellCheck={false}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.signature"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          aria-invalid={out && !out.ok ? true : undefined}
          aria-describedby={out && !out.ok ? "t-jwt-err" : undefined}
        />
        {out && !out.ok && (
          <p id="t-jwt-err" className="err" role="alert">
            {out.error}
          </p>
        )}
      </div>
      {out?.ok && (
        <>
          <div className="jwt-parts">
            <div>
              <span className="f-label">Header</span>
              <pre className="http">{JSON.stringify(out.header, null, 2)}</pre>
            </div>
            <div>
              <span className="f-label">Payload</span>
              <pre className="http">{JSON.stringify(out.payload, null, 2)}</pre>
            </div>
          </div>
          <ResultList result={out.result} />
        </>
      )}
    </div>
  );
}
