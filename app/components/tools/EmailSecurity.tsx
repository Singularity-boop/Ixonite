"use client";

import { useState } from "react";
import { ArrowRight } from "../icons";
import ResultsGate from "./ResultsGate";
import { ResultList, type Check, type ToolResult } from "./results";

const DKIM_SELECTORS = [
  "google", "selector1", "selector2", "default", "k1", "k2", "s1", "s2", "dkim", "mail",
  "smtp", "mandrill", "mxvault", "zoho", "protonmail", "sig1", "everlytickey1", "cm", "pm", "mailjet",
];

export function cleanDomain(input: string) {
  let d = input.trim().toLowerCase();
  d = d.replace(/^[a-z]+:\/\//, "").replace(/^.*@/, "").split(/[/?#:]/)[0].replace(/\.$/, "");
  return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(d) ? d : null;
}

async function txt(name: string): Promise<string[]> {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`, {
    headers: { accept: "application/dns-json" },
  });
  if (!res.ok) throw new Error("dns");
  const json = (await res.json()) as { Answer?: { type: number; data: string }[] };
  return (json.Answer ?? [])
    .filter((a) => a.type === 16)
    .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
}

async function hasMx(name: string) {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=MX`, {
    headers: { accept: "application/dns-json" },
  });
  const json = (await res.json()) as { Answer?: { type: number; data: string }[] };
  return (json.Answer ?? []).filter((a) => a.type === 15).map((a) => a.data.split(" ").pop()!.replace(/\.$/, ""));
}

const tag = (rec: string, key: string) => rec.match(new RegExp(`(?:^|;)\\s*${key}\\s*=\\s*([^;]+)`, "i"))?.[1].trim();

export async function checkEmailDomain(domain: string): Promise<ToolResult> {
  const [rootTxt, dmarcTxt, mx, dkim] = await Promise.all([
    txt(domain),
    txt(`_dmarc.${domain}`),
    hasMx(domain),
    Promise.all(
      DKIM_SELECTORS.map(async (s) => ((await txt(`${s}._domainkey.${domain}`).catch(() => [])).some((r) => /p=/.test(r)) ? s : null)),
    ),
  ]);
  const checks: Check[] = [];
  let score = 0;

  // MX
  checks.push(
    mx.length
      ? { label: "Mail servers (MX)", status: "info", detail: `This domain receives email through ${mx.slice(0, 3).join(", ")}${mx.length > 3 ? " and others" : ""}.` }
      : { label: "Mail servers (MX)", status: "info", detail: "No MX records. The domain does not receive email, but it can still be spoofed as a sender, so SPF and DMARC still matter." },
  );

  // SPF
  const spf = rootTxt.filter((r) => /^v=spf1\b/i.test(r));
  if (spf.length === 0) {
    checks.push({
      label: "SPF record",
      status: "fail",
      detail: "No SPF record. Receiving servers cannot tell which servers are allowed to send email for this domain.",
      fix: mx.length ? `Add a TXT record at ${domain}: "v=spf1 include:<your email provider> -all".` : `This domain sends no email, so publish: "v=spf1 -all".`,
    });
  } else if (spf.length > 1) {
    checks.push({ label: "SPF record", status: "fail", detail: "More than one SPF record. Receivers treat this as an error and SPF fails for every email.", value: spf.join("\n"), fix: "Merge them into a single v=spf1 record." });
  } else {
    const rec = spf[0];
    const all = rec.match(/([-~?+]?)all\b/i);
    const lookups = (rec.match(/\b(include:|a\b|a:|mx\b|mx:|ptr|exists:|redirect=)/gi) ?? []).length;
    if (!all && !/redirect=/i.test(rec)) {
      checks.push({ label: "SPF record", status: "fail", detail: "The SPF record has no 'all' rule, so mail from any server is treated as neutral.", value: rec, fix: "End the record with -all (or ~all while testing)." });
    } else if (all && (all[1] === "+" || all[1] === "?")) {
      checks.push({ label: "SPF record", status: "fail", detail: `The record ends in ${all[0]}, which lets any server send as this domain.`, value: rec, fix: "Change it to -all." });
    } else if (all && all[1] === "~") {
      score += 2;
      checks.push({ label: "SPF record", status: "warn", detail: "SPF is set to soft fail (~all). Forged mail is marked but usually still delivered unless DMARC enforces it.", value: rec, fix: "Once all your senders are listed, switch ~all to -all." });
    } else {
      score += 3;
      checks.push({ label: "SPF record", status: "pass", detail: "SPF is published and rejects mail from unlisted servers.", value: rec });
    }
    if (lookups > 10) {
      checks.push({ label: "SPF lookup limit", status: "fail", detail: `This record needs about ${lookups} DNS lookups. SPF allows 10, so checks will fail with a permanent error.`, fix: "Remove unused includes or flatten the record." });
    }
  }

  // DMARC
  const dmarc = dmarcTxt.filter((r) => /^v=DMARC1\b/i.test(r));
  if (dmarc.length === 0) {
    checks.push({
      label: "DMARC policy",
      status: "fail",
      detail: "No DMARC record. Nothing tells receivers to block email that fails SPF and DKIM, so this domain is easy to spoof.",
      fix: `Add a TXT record at _dmarc.${domain}: "v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}". Move to p=reject once reports look clean.`,
    });
  } else {
    const rec = dmarc[0];
    const p = (tag(rec, "p") ?? "").toLowerCase();
    const pct = Number(tag(rec, "pct") ?? "100");
    if (p === "reject" || p === "quarantine") {
      score += pct < 100 ? 3 : 4;
      checks.push({
        label: "DMARC policy",
        status: pct < 100 ? "warn" : "pass",
        detail: pct < 100 ? `DMARC enforces p=${p}, but only on ${pct}% of failing mail.` : `DMARC enforces p=${p}: email that fails authentication is ${p === "reject" ? "rejected" : "sent to spam"}.`,
        value: rec,
        fix: pct < 100 ? "Raise pct to 100." : undefined,
      });
    } else {
      score += 1;
      checks.push({ label: "DMARC policy", status: "warn", detail: "DMARC is set to p=none, which only monitors. Spoofed email is still delivered.", value: rec, fix: "Review the reports, then move to p=quarantine and later p=reject." });
    }
    checks.push(
      tag(rec, "rua")
        ? { label: "DMARC reporting", status: "pass", detail: "Aggregate reports are sent, so you can see who sends email as you." }
        : { label: "DMARC reporting", status: "warn", detail: "No rua= address, so you get no reports about who sends email as your domain.", fix: `Add rua=mailto:dmarc@${domain} to the record.` },
    );
  }

  // DKIM
  const found = dkim.filter(Boolean) as string[];
  if (found.length) {
    score += 2;
    checks.push({ label: "DKIM signing", status: "pass", detail: `DKIM keys found for selector${found.length > 1 ? "s" : ""}: ${found.join(", ")}.` });
  } else {
    checks.push({
      label: "DKIM signing",
      status: "warn",
      detail: `No DKIM key found on ${DKIM_SELECTORS.length} common selectors. Your provider may use a custom selector, so check its admin panel.`,
      fix: "Turn on DKIM signing in your email provider and publish the key it gives you.",
    });
  }

  const grade = score >= 9 ? "A" : score >= 7 ? "B" : score >= 5 ? "C" : score >= 3 ? "D" : "F";
  const spoofable = !dmarc.length || /p\s*=\s*none/i.test(dmarc[0] ?? "");
  return {
    tool: "Email spoofing check",
    target: domain,
    grade,
    summary: spoofable
      ? "Attackers can likely send email that appears to come from this domain."
      : "This domain is protected against basic email spoofing.",
    checks,
  };
}

export default function EmailSecurity() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ToolResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const domain = cleanDomain(input);
    if (!domain) {
      setError("Enter a domain like example.com.");
      setState("error");
      return;
    }
    setState("loading");
    setResult(null);
    try {
      setResult(await checkEmailDomain(domain));
      setState("idle");
    } catch {
      setError("The DNS lookup failed. Check your connection and try again.");
      setState("error");
    }
  }

  return (
    <div className="tool">
      <form className="tool-form" onSubmit={onSubmit} noValidate>
        <label className="lbl" htmlFor="t-domain">
          Domain
        </label>
        <div className="intake-row">
          <input
            id="t-domain"
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
            {state === "loading" ? "Checking…" : "Check domain"} <ArrowRight />
          </button>
        </div>
        {state === "error" && (
          <p id="t-err" className="err" role="alert">
            {error}
          </p>
        )}
      </form>
      {result && (
        <>
          <ResultList result={result} />
          <ResultsGate result={result} />
        </>
      )}
    </div>
  );
}
