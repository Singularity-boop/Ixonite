"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "../icons";

const COMMON = new Set(
  "password,123456,123456789,qwerty,12345678,111111,1234567,iloveyou,admin,welcome,monkey,dragon,letmein,football,baseball,abc123,sunshine,princess,master,shadow,superman,trustno1,passw0rd,password1,qwerty123,000000,654321,michael,jessica,charlie,ashley,login,starwars,hello,freedom,whatever,qazwsx,zaq12wsx,computer,secret,summer,winter,spring,autumn,pakistan,india,london,cricket,lovely,flower,hunter,killer,soccer,batman,access,mustang,changeme,default,test,guest,root,user,company,office,ixonite".split(","),
);
const WALKS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "abcdefghijklmnopqrstuvwxyz"];
const WORDS =
  "anchor apple arrow atlas badge bamboo basket beacon border bottle breeze bridge bucket button cabin cactus camera candle canyon carbon castle cedar chalk cherry circle clover cobalt comet copper coral cotton crater crystal dagger desert dolphin dragon ember engine falcon feather fiber forest fossil galaxy garden glacier granite gravel harbor hazel helmet hollow horizon island jacket jungle kettle ladder lantern lemon lizard magnet maple marble meadow meteor mirror monsoon mosaic nectar needle nickel oasis olive orbit orchid oyster paddle panther pebble pepper pillow pilot planet pocket pollen prism quartz quiver rabbit raven ribbon river rocket saddle salmon shadow signal silver socket spiral spruce statue summit tablet temple thunder timber tunnel turtle velvet violet walnut willow window winter zephyr".split(
    " ",
  );

function estimate(pw: string) {
  if (!pw) return null;
  const lower = pw.toLowerCase();
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(Math.max(pool, 1));
  const issues: string[] = [];

  const stripped = lower.replace(/[^a-z]/g, "").replace(/0/g, "o");
  if (COMMON.has(lower) || COMMON.has(stripped)) {
    bits = Math.min(bits, 10);
    issues.push("This is one of the most common passwords. Attackers try it first.");
  } else if ([...COMMON].some((w) => w.length >= 5 && lower.includes(w))) {
    bits -= 18;
    issues.push("Contains a common password or word.");
  }
  if (/(.)\1{2,}/.test(pw)) {
    bits -= 10;
    issues.push("Repeated characters (like aaa) add almost nothing.");
  }
  if (WALKS.some((w) => [...Array(w.length - 3).keys()].some((i) => lower.includes(w.slice(i, i + 4))))) {
    bits -= 12;
    issues.push("Contains a keyboard or alphabet sequence.");
  }
  if (/(19|20)\d{2}/.test(pw)) {
    bits -= 6;
    issues.push("Contains a year, which attackers guess early.");
  }
  if (pw.length < 12) issues.push("Shorter than 12 characters. Length matters more than symbols.");
  bits = Math.max(0, bits);

  // Offline attack on a fast hash at 10 billion guesses per second.
  const seconds = Math.pow(2, bits) / 2 / 1e10;
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  return { bits: Math.round(bits), seconds, score, issues };
}

function human(seconds: number) {
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [31536000 * 100, "centuries"],
    [31536000, "years"],
    [2592000, "months"],
    [86400, "days"],
    [3600, "hours"],
    [60, "minutes"],
    [1, "seconds"],
  ];
  if (seconds > 31536000 * 1e6) return "millions of years";
  for (const [s, name] of units) {
    if (seconds >= s) {
      const n = Math.round(seconds / s);
      return name === "centuries" ? `${n.toLocaleString()} centuries` : `${n.toLocaleString()} ${name}`;
    }
  }
  return "instantly";
}

async function sha1Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function breachCount(pw: string) {
  const hash = await sha1Hex(pw);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!res.ok) throw new Error("hibp");
  const suffix = hash.slice(5);
  for (const line of (await res.text()).split("\n")) {
    const [s, n] = line.trim().split(":");
    if (s === suffix) return Number(n);
  }
  return 0;
}

function randomInt(max: number) {
  const a = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  do crypto.getRandomValues(a);
  while (a[0] >= limit);
  return a[0] % max;
}

function generate(kind: "phrase" | "chars") {
  if (kind === "phrase") {
    const words = Array.from({ length: 5 }, () => WORDS[randomInt(WORDS.length)]);
    return `${words.join("-")}-${randomInt(100)}`;
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+?";
  return Array.from({ length: 20 }, () => chars[randomInt(chars.length)]).join("");
}

const LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

export default function PasswordCheck() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [breach, setBreach] = useState<{ state: "idle" | "loading" | "done" | "error"; count?: number; for?: string }>({ state: "idle" });
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const est = useMemo(() => estimate(pw), [pw]);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setBreach({ state: "loading" });
    try {
      setBreach({ state: "done", count: await breachCount(pw), for: pw });
    } catch {
      setBreach({ state: "error" });
    }
  }

  const stale = breach.state === "done" && breach.for !== pw;

  return (
    <div className="tool">
      <form className="tool-form" onSubmit={onCheck} noValidate>
        <label className="lbl" htmlFor="t-pw">
          Password
        </label>
        <div className="intake-row">
          <div className="pw-wrap">
            <input
              id="t-pw"
              className="input"
              type={show ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Type a password to test"
            />
            <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} aria-pressed={show}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <button className="btn btn-primary" type="submit" disabled={!pw || breach.state === "loading"}>
            {breach.state === "loading" ? "Checking…" : "Check breaches"} <ArrowRight />
          </button>
        </div>
      </form>

      {est && (
        <div className="results" aria-live="polite">
          <div className="meter" data-score={est.score}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={i <= est.score ? "on" : ""} />
            ))}
          </div>
          <div className="results-head" style={{ borderBottom: 0 }}>
            <div>
              <p className="results-target">{LABELS[est.score]}</p>
              <p className="results-summary">
                An attacker with a stolen password database could crack this{" "}
                <b>{est.seconds < 1 ? "instantly" : `in about ${human(est.seconds)}`}</b>.
              </p>
              <p className="results-counts typed tnum">≈ {est.bits} bits of entropy</p>
            </div>
          </div>
          {est.issues.length > 0 && (
            <ul className="checks">
              {est.issues.map((i) => (
                <li key={i} className="check check-warn">
                  <span className="mark mark-warn" role="img" aria-label="Warning">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 6v8M12 17.5v1" />
                    </svg>
                  </span>
                  <div>
                    <p>{i}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {breach.state === "done" && !stale && (
            <ul className="checks">
              <li className={`check check-${breach.count ? "fail" : "pass"}`}>
                <span className={`mark mark-${breach.count ? "fail" : "pass"}`} role="img" aria-label={breach.count ? "Fail" : "Pass"}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    {breach.count ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M5 12.5l4.5 4.5L19 7.5" />}
                  </svg>
                </span>
                <div>
                  <h3>{breach.count ? "Found in data breaches" : "Not found in known breaches"}</h3>
                  <p>
                    {breach.count
                      ? `This password appears ${breach.count.toLocaleString()} times in leaked password lists. Attackers try these first. Stop using it everywhere.`
                      : "Good. That doesn't make it strong, but it isn't on the lists attackers try first."}
                  </p>
                </div>
              </li>
            </ul>
          )}
          {breach.state === "error" && (
            <p className="err" role="alert">
              The breach lookup didn&apos;t respond. Try again in a moment.
            </p>
          )}
        </div>
      )}

      <div className="gen">
        <div>
          <h3 className="d-md">Need a better one?</h3>
          <p>Generated in your browser with a secure random source. Store it in a password manager.</p>
        </div>
        <div className="gen-row">
          <button type="button" className="btn" onClick={() => (setGenerated(generate("phrase")), setCopied(false))}>
            Passphrase
          </button>
          <button type="button" className="btn" onClick={() => (setGenerated(generate("chars")), setCopied(false))}>
            20 characters
          </button>
        </div>
        {generated && (
          <div className="gen-out">
            <code className="typed">{generated}</code>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await navigator.clipboard.writeText(generated).catch(() => {});
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
