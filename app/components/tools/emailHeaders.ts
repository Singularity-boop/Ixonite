// Parses raw email headers in the browser: delivery hops, SPF/DKIM/DMARC
// results and the usual phishing tells. Nothing is sent anywhere.
import type { Check, ToolResult } from "./results";

export type Header = { name: string; value: string };
export type Hop = { from?: string; ip?: string; by?: string; with?: string; date?: Date; delay?: number };

export function parseHeaders(raw: string): Header[] {
  const lines = raw.replace(/\r\n?/g, "\n").replace(/^\s*\n/, "").split("\n");
  const out: Header[] = [];
  for (const line of lines) {
    if (line === "" && out.length) break; // end of the header block
    if (/^[ \t]/.test(line) && out.length) {
      out[out.length - 1].value += " " + line.trim();
      continue;
    }
    const m = line.match(/^([!-9;-~]+):[ \t]?(.*)$/);
    if (m) out.push({ name: m[1], value: m[2].trim() });
  }
  return out;
}

const all = (h: Header[], name: string) => h.filter((x) => x.name.toLowerCase() === name.toLowerCase()).map((x) => x.value);
const first = (h: Header[], name: string) => all(h, name)[0];

function parseDate(s?: string) {
  if (!s) return undefined;
  const d = new Date(s.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim());
  return isNaN(d.getTime()) ? undefined : d;
}

export function parseHops(h: Header[]): Hop[] {
  // Received headers are prepended by each server, so the bottom one is the first hop.
  const hops = all(h, "Received")
    .reverse()
    .map((v): Hop => {
      const semi = v.lastIndexOf(";");
      const body = semi >= 0 ? v.slice(0, semi) : v;
      return {
        from: body.match(/\bfrom\s+([^\s;()]+)/i)?.[1],
        ip: body.match(/\[(?:IPv6:)?([0-9a-f:.]{3,})\]/i)?.[1],
        by: body.match(/\bby\s+([^\s;()]+)/i)?.[1],
        with: body.match(/\bwith\s+([^\s;()]+)/i)?.[1],
        date: parseDate(semi >= 0 ? v.slice(semi + 1) : undefined),
      };
    });
  for (let i = 1; i < hops.length; i++) {
    const a = hops[i - 1].date;
    const b = hops[i].date;
    if (a && b) hops[i].delay = Math.max(0, (b.getTime() - a.getTime()) / 1000);
  }
  return hops;
}

export function parseAddress(v?: string) {
  if (!v) return null;
  const angle = v.match(/<([^<>\s]+@[^<>\s]+)>/);
  const address = (angle?.[1] ?? v.match(/[^\s<>"',;]+@[^\s<>"',;]+/)?.[0] ?? "").toLowerCase();
  const name = angle ? v.slice(0, v.indexOf("<")).replace(/^\s*"|"\s*$/g, "").trim() : "";
  return { name, address, domain: address.split("@")[1] ?? "" };
}

// Close enough for alignment checks: the last two labels, or three for
// common country second-level domains (example.co.uk).
const SLD = /\.(co|com|org|net|ac|gov|edu)\.[a-z]{2}$/;
export function orgDomain(d: string) {
  const labels = d.toLowerCase().replace(/\.$/, "").split(".");
  return labels.slice(SLD.test(d.toLowerCase()) ? -3 : -2).join(".");
}

function authResults(h: Header[]) {
  // The top Authentication-Results header is the one your own mail server added.
  const sources = [...all(h, "Authentication-Results"), ...all(h, "ARC-Authentication-Results")];
  const pick = (method: string) => {
    for (const s of sources) {
      const m = s.match(new RegExp(`\\b${method}=([a-z]+)`, "i"));
      if (m) return m[1].toLowerCase();
    }
    return undefined;
  };
  let spf = pick("spf");
  const received = first(h, "Received-SPF");
  if (!spf && received) spf = received.split(/\s/)[0].toLowerCase();
  return { spf, dkim: pick("dkim"), dmarc: pick("dmarc"), found: sources.length > 0 || Boolean(received) };
}

export function formatDelay(sec?: number) {
  if (sec === undefined) return "–";
  if (sec < 1) return "0s";
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)}h`;
  return `${(sec / 86400).toFixed(1)}d`;
}

const PRIVATE_IP = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fe80:|fc|fd)/i;

export function analyse(raw: string) {
  const h = parseHeaders(raw);
  const known = ["received", "from", "to", "subject", "date", "message-id", "authentication-results", "return-path", "dkim-signature"];
  if (!h.some((x) => known.includes(x.name.toLowerCase()))) {
    throw new Error("These don't look like email headers. Paste the full header block, starting with lines like Received: or From:.");
  }

  const hops = parseHops(h);
  const from = parseAddress(first(h, "From"));
  const replyTo = parseAddress(first(h, "Reply-To"));
  const returnPath = parseAddress(first(h, "Return-Path"));
  const msgIdDomain = first(h, "Message-ID")?.match(/@([^>\s]+)>?/)?.[1]?.toLowerCase();
  const dkimDomains = all(h, "DKIM-Signature")
    .map((s) => s.match(/\bd=([^;\s]+)/i)?.[1]?.toLowerCase())
    .filter((d): d is string => Boolean(d));
  const auth = authResults(h);
  const fromOrg = from?.domain ? orgDomain(from.domain) : "";
  const checks: Check[] = [];

  const authCheck = (label: string, result: string | undefined, what: string, fix: string) => {
    if (!result) {
      checks.push({ label, status: "info", detail: `No ${label} result in these headers. ${auth.found ? "" : "Copy the headers from the inbox that received the email, so your mail server's checks are included."}`.trim() });
    } else if (result === "pass") {
      checks.push({ label, status: "pass", detail: `${label} passed: ${what}` });
    } else if (result === "fail" || result === "permerror") {
      checks.push({ label, status: "fail", detail: `${label} result: ${result}. The receiving server could not confirm ${what.replace(/\.$/, "")}.`, fix });
    } else {
      checks.push({ label, status: "warn", detail: `${label} result: ${result}. That neither confirms nor rules out spoofing.`, fix });
    }
  };
  authCheck("SPF", auth.spf, "the sending server is allowed to send for the envelope domain.", "If this is your domain, list every service that sends your email in the SPF record.");
  authCheck("DKIM", auth.dkim, "a valid signature was found and the message wasn't changed in transit.", "If this is your domain, turn on DKIM signing in every service that sends your email.");
  authCheck("DMARC", auth.dmarc, "the visible From domain matches a domain that passed SPF or DKIM.", "Treat the email as untrusted. If this is your domain, check its DMARC setup with our email spoofing checker.");

  if (from?.name) {
    const shown = from.name.match(/[^\s<>"',;]+@[^\s<>"',;]+/)?.[0]?.toLowerCase();
    if (shown && shown !== from.address) {
      checks.push({
        label: "Display name trick",
        status: "fail",
        detail: `The display name shows ${shown}, but the email actually came from ${from.address}. Mail apps often show only the name, so this is a classic spoofing trick.`,
        fix: "Don't trust the name. Check the real address before replying or clicking anything.",
      });
    }
  }

  if (from?.domain && replyTo?.domain && orgDomain(replyTo.domain) !== fromOrg) {
    checks.push({
      label: "Reply-To",
      status: "warn",
      detail: `Replies go to ${replyTo.address}, not to the sender's domain (${from.domain}). This is common in invoice fraud and CEO-impersonation emails.`,
      fix: "Confirm through a known channel before replying, especially to payment or data requests.",
    });
  }

  if (from?.domain && returnPath?.domain && orgDomain(returnPath.domain) !== fromOrg) {
    checks.push({
      label: "Return-Path",
      status: "info",
      detail: `Bounces go to ${returnPath.domain}, a different domain from the sender. Normal for newsletters and email services, but SPF then checks ${returnPath.domain}, not ${from.domain}.`,
    });
  }

  if (from?.domain && dkimDomains.length) {
    const aligned = dkimDomains.some((d) => orgDomain(d) === fromOrg);
    checks.push(
      aligned
        ? { label: "DKIM alignment", status: "pass", detail: `Signed by ${dkimDomains.join(", ")}, which matches the sender's domain.` }
        : {
            label: "DKIM alignment",
            status: auth.dmarc === "pass" ? "info" : "warn",
            detail: `Signed by ${dkimDomains.join(", ")}, not by ${from.domain}. A signature from another domain doesn't prove who sent it.`,
          },
    );
  }

  if (from?.domain && msgIdDomain && orgDomain(msgIdDomain) !== fromOrg) {
    checks.push({ label: "Message-ID", status: "info", detail: `The Message-ID was created by ${msgIdDomain}, not ${from.domain}. Usual for email services, worth a look otherwise.` });
  }

  const origin = hops.find((x) => x.ip && !PRIVATE_IP.test(x.ip));
  if (origin) {
    checks.push({ label: "Origin", status: "info", detail: `First public server: ${origin.from && !origin.from.startsWith("[") ? `${origin.from} ` : ""}[${origin.ip}].` });
  }
  const slow = hops.map((x, i) => ({ i, d: x.delay ?? 0 })).filter((x) => x.d > 3600);
  const dated = hops.filter((x) => x.date);
  if (dated.length >= 2) {
    const total = (dated[dated.length - 1].date!.getTime() - dated[0].date!.getTime()) / 1000;
    checks.push({
      label: "Delivery time",
      status: slow.length ? "warn" : "info",
      detail: slow.length
        ? `Delivered in ${formatDelay(total)} across ${hops.length} hops. Hop ${slow.map((x) => x.i + 1).join(", ")} held the email for over an hour (often greylisting or a stuck queue).`
        : `Delivered in ${formatDelay(Math.max(0, total))} across ${hops.length} hops.`,
    });
  }

  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const result: ToolResult = {
    tool: "Email header analyzer",
    target: first(h, "Subject") || from?.address || "Email headers",
    summary: fails
      ? "This email failed authentication or shows spoofing signs. Treat it as suspicious."
      : warns
        ? "Nothing conclusive, but some checks need a closer look."
        : auth.dmarc === "pass"
          ? "This email passed authentication for its sender's domain."
          : "No red flags found in these headers.",
    checks,
  };

  const fields = ["From", "Reply-To", "To", "Subject", "Date", "Return-Path", "Message-ID"]
    .map((name) => ({ name, value: first(h, name) }))
    .filter((f): f is { name: string; value: string } => Boolean(f.value));

  return { result, hops, fields };
}

// Synthetic sample using reserved example domains and documentation IPs.
export const SAMPLE = `Delivered-To: finance@example.com
Received: by 2002:a05:6512:3d1:b0:4f8:1a2b:3c4d with SMTP id x17csp112233;
        Tue, 14 Oct 2025 09:42:31 -0700 (PDT)
Authentication-Results: mx.example.com;
       dkim=pass header.i=@mailer.example.net header.s=s1 header.b=AbCdEf12;
       spf=softfail (example.com: domain of transitioning billing@example.org does not designate 203.0.113.45 as permitted sender) smtp.mailfrom=billing@example.org;
       dmarc=fail (p=NONE sp=NONE dis=NONE) header.from=example.org
Received: from relay.mailer.example.net (relay.mailer.example.net. [203.0.113.45])
        by mx.example.com with ESMTPS id k9si2233445;
        Tue, 14 Oct 2025 09:42:30 -0700 (PDT)
Received: from [198.51.100.23] (unknown [198.51.100.23])
        by relay.mailer.example.net (Postfix) with ESMTPA id 4F1A2B3C;
        Tue, 14 Oct 2025 16:42:27 +0000 (UTC)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=mailer.example.net; s=s1; h=from:to:subject:date; bh=abc=; b=AbCdEf12
From: "ceo@example.com" <billing@example.org>
Reply-To: payments.desk@example.net
To: finance@example.com
Subject: Urgent: updated bank details for invoice 4471
Date: Tue, 14 Oct 2025 16:42:25 +0000
Message-ID: <20251014164225.ABC123@relay.mailer.example.net>
Return-Path: <billing@example.org>
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"`;
