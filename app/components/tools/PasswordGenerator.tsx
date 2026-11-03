"use client";

import { useCallback, useEffect, useState } from "react";
import WORDS from "./eff-wordlist";
import { STRENGTH_LABELS, crackSeconds, humanTime, randomInt, strengthScore } from "./random";

const SETS = {
  upper: { label: "Uppercase (A–Z)", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  lower: { label: "Lowercase (a–z)", chars: "abcdefghijklmnopqrstuvwxyz" },
  digits: { label: "Numbers (0–9)", chars: "0123456789" },
  symbols: { label: "Symbols (!@#…)", chars: "!@#$%^&*()-_=+[]{};:,.<>?/~" },
} as const;
type SetKey = keyof typeof SETS;
const AMBIGUOUS = /[O0oIl1|]/g;

const SEPARATORS = [
  { value: "-", label: "Hyphen (-)" },
  { value: ".", label: "Dot (.)" },
  { value: "_", label: "Underscore (_)" },
  { value: " ", label: "Space" },
];

type Opts = {
  mode: "chars" | "phrase";
  length: number;
  sets: Record<SetKey, boolean>;
  avoidAmbiguous: boolean;
  words: number;
  separator: string;
  capitalize: boolean;
  addNumber: boolean;
};

const DEFAULTS: Opts = {
  mode: "chars",
  length: 20,
  sets: { upper: true, lower: true, digits: true, symbols: true },
  avoidAmbiguous: false,
  words: 6,
  separator: "-",
  capitalize: true,
  addNumber: true,
};

function pools(o: Opts) {
  return (Object.keys(SETS) as SetKey[])
    .filter((k) => o.sets[k])
    .map((k) => (o.avoidAmbiguous ? SETS[k].chars.replace(AMBIGUOUS, "") : SETS[k].chars));
}

// Returns the password and its entropy in bits. Every chosen character type
// appears at least once (redrawn until it does), which costs well under a bit.
function generate(o: Opts): { value: string; bits: number } | null {
  if (o.mode === "phrase") {
    const words = Array.from({ length: o.words }, () => {
      const w = WORDS[randomInt(WORDS.length)];
      return o.capitalize ? w[0].toUpperCase() + w.slice(1) : w;
    });
    let bits = o.words * Math.log2(WORDS.length);
    if (o.addNumber) {
      const i = randomInt(words.length);
      words[i] += String(randomInt(10));
      bits += Math.log2(10) + Math.log2(words.length);
    }
    return { value: words.join(o.separator), bits };
  }
  const groups = pools(o);
  if (!groups.length) return null;
  const all = groups.join("");
  let value = "";
  do value = Array.from({ length: o.length }, () => all[randomInt(all.length)]).join("");
  while (o.length >= groups.length && !groups.every((g) => [...value].some((c) => g.includes(c))));
  return { value, bits: o.length * Math.log2(all.length) };
}

export default function PasswordGenerator() {
  const [o, setO] = useState<Opts>(DEFAULTS);
  const [out, setOut] = useState<{ value: string; bits: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback((next: Opts) => {
    setOut(generate(next));
    setCopied(false);
  }, []);

  // Generate on the client only, so the server never renders a password.
  useEffect(() => {
    const id = requestAnimationFrame(() => regenerate(DEFAULTS));
    return () => cancelAnimationFrame(id);
  }, [regenerate]);

  const update = (patch: Partial<Opts>) => {
    const next = { ...o, ...patch };
    setO(next);
    regenerate(next);
  };

  const noSets = o.mode === "chars" && !pools(o).length;
  const score = out ? strengthScore(out.bits) : 0;

  return (
    <div className="tool">
      <div className="gen-main">
        <span className="f-label" id="pg-out-label">
          Your new password
        </span>
        <div className="gen-out">
          <output className="typed gen-value" aria-labelledby="pg-out-label" aria-live="polite">
            {noSets ? "Pick at least one character type." : out?.value ?? "…"}
          </output>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!out || noSets}
            onClick={async () => {
              if (!out) return;
              await navigator.clipboard.writeText(out.value).catch(() => {});
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className="btn" onClick={() => regenerate(o)} disabled={noSets}>
            New password
          </button>
        </div>
        {out && !noSets && (
          <div className="gen-strength">
            <div className="meter" data-score={score} aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={i <= score ? "on" : ""} />
              ))}
            </div>
            <p>
              <b>{STRENGTH_LABELS[score]}</b>: about <span className="tnum">{Math.floor(out.bits)}</span> bits of
              entropy. Cracking it offline would take {humanTime(crackSeconds(out.bits))} on average.
            </p>
          </div>
        )}
      </div>

      <div className="gen-opts">
        <fieldset className="seg">
          <legend className="lbl">Type</legend>
          <div className="seg-row">
            {(
              [
                ["chars", "Random characters"],
                ["phrase", "Passphrase (words)"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className="seg-opt">
                <input type="radio" name="pg-mode" value={v} checked={o.mode === v} onChange={() => update({ mode: v })} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {o.mode === "chars" ? (
          <>
            <div>
              <label className="lbl" htmlFor="pg-length">
                Length: <span className="tnum">{o.length}</span> characters
              </label>
              <input
                id="pg-length"
                className="range"
                type="range"
                min={8}
                max={64}
                value={o.length}
                onChange={(e) => update({ length: Number(e.target.value) })}
              />
            </div>
            <fieldset className="chk-grid">
              <legend className="lbl">Include</legend>
              {(Object.keys(SETS) as SetKey[]).map((k) => (
                <label key={k} className="chk">
                  <input type="checkbox" checked={o.sets[k]} onChange={(e) => update({ sets: { ...o.sets, [k]: e.target.checked } })} />
                  {SETS[k].label}
                </label>
              ))}
              <label className="chk">
                <input type="checkbox" checked={o.avoidAmbiguous} onChange={(e) => update({ avoidAmbiguous: e.target.checked })} />
                Avoid look-alikes (0 O o 1 l I |)
              </label>
            </fieldset>
          </>
        ) : (
          <>
            <div>
              <label className="lbl" htmlFor="pg-words">
                Words: <span className="tnum">{o.words}</span>
              </label>
              <input
                id="pg-words"
                className="range"
                type="range"
                min={3}
                max={12}
                value={o.words}
                onChange={(e) => update({ words: Number(e.target.value) })}
              />
            </div>
            <div className="gen-pair">
              <div>
                <label className="lbl" htmlFor="pg-sep">
                  Separator
                </label>
                <select id="pg-sep" className="input select" value={o.separator} onChange={(e) => update({ separator: e.target.value })}>
                  {SEPARATORS.map((s) => (
                    <option key={s.label} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <fieldset className="chk-grid">
                <legend className="lbl">Options</legend>
                <label className="chk">
                  <input type="checkbox" checked={o.capitalize} onChange={(e) => update({ capitalize: e.target.checked })} />
                  Capitalize each word
                </label>
                <label className="chk">
                  <input type="checkbox" checked={o.addNumber} onChange={(e) => update({ addNumber: e.target.checked })} />
                  Add a number
                </label>
              </fieldset>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
