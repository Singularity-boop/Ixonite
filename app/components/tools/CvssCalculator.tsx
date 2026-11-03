"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BASE_METRICS,
  TEMPORAL_METRICS,
  isComplete,
  parseVector,
  score,
  severity,
  toVectorString,
  type Metric,
  type Vector,
} from "./cvss";

const EXAMPLES: { label: string; vector: string }[] = [
  { label: "SQL injection, no login", vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" },
  { label: "IDOR: read other users' data", vector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N" },
  { label: "Stored XSS", vector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N" },
];

function MetricGroup({ m, value, onPick }: { m: Metric; value?: string; onPick: (v: string) => void }) {
  const picked = m.values.find((x) => x.v === value);
  return (
    <fieldset className="seg cvss-metric">
      <legend className="lbl">
        {m.name} <span className="typed">({m.key})</span>
      </legend>
      <div className="seg-row">
        {m.values.map((x) => (
          <label key={x.v} className="seg-opt">
            <input type="radio" name={`cvss-${m.key}`} value={x.v} checked={value === x.v} onChange={() => onPick(x.v)} />
            <span>{x.label}</span>
          </label>
        ))}
      </div>
      <p className="seg-help">{picked ? picked.help : "Not chosen yet."}</p>
    </fieldset>
  );
}

export default function CvssCalculator() {
  const [v, setV] = useState<Vector>({});
  const [paste, setPaste] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [copied, setCopied] = useState<"" | "vector" | "link">("");

  // A shared link carries the vector in the hash: /tools/cvss-calculator/#CVSS:3.1/AV:N/...
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    const parsed = parseVector(hash);
    if (!parsed.ok) return;
    const id = requestAnimationFrame(() => setV(parsed.vector));
    return () => cancelAnimationFrame(id);
  }, []);

  const s = useMemo(() => score(v), [v]);
  const vector = isComplete(v) ? toVectorString(v) : "";

  useEffect(() => {
    if (vector) window.history.replaceState(null, "", `#${vector}`);
  }, [vector]);

  const pick = (key: string, val: string) => {
    setV((cur) => ({ ...cur, [key]: val }));
    setCopied("");
  };

  function load(text: string) {
    const parsed = parseVector(text);
    if (!parsed.ok) {
      setPasteError(parsed.error);
      return;
    }
    setPasteError("");
    setV(parsed.vector);
    setCopied("");
  }

  async function copy(kind: "vector" | "link") {
    const text = kind === "vector" ? vector : `${window.location.origin}${window.location.pathname}#${vector}`;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(kind);
  }

  const missing = BASE_METRICS.filter((m) => !v[m.key]).length;
  const final = s ? (s.temporal ?? s.base) : null;
  const sev = final === null ? "" : severity(final);

  return (
    <div className="tool">
      <form
        className="tool-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          load(paste);
        }}
      >
        <label className="lbl" htmlFor="t-vector">
          Paste a vector <em>(optional)</em>
        </label>
        <div className="intake-row">
          <input
            id="t-vector"
            className="input"
            placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
            autoComplete="off"
            spellCheck={false}
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setPasteError("");
            }}
            aria-invalid={pasteError ? true : undefined}
            aria-describedby={pasteError ? "t-vector-err" : undefined}
          />
          <button className="btn" type="submit" disabled={!paste.trim()}>
            Load vector
          </button>
        </div>
        {pasteError && (
          <p id="t-vector-err" className="err" role="alert">
            {pasteError}
          </p>
        )}
        <p className="cvss-examples">
          <span>Examples:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" className="chip" onClick={() => load(ex.vector)}>
              {ex.label}
            </button>
          ))}
        </p>
      </form>

      <div className="cvss-layout">
        <div className="cvss-metrics">
          <h2 className="d-md">Base metrics</h2>
          {BASE_METRICS.map((m) => (
            <MetricGroup key={m.key} m={m} value={v[m.key]} onPick={(val) => pick(m.key, val)} />
          ))}
          <details className="cvss-temporal">
            <summary>
              <span className="d-md">Temporal metrics</span> <em>(optional)</em>
            </summary>
            {TEMPORAL_METRICS.map((m) => (
              <MetricGroup key={m.key} m={m} value={v[m.key] ?? "X"} onPick={(val) => pick(m.key, val)} />
            ))}
          </details>
        </div>

        <aside className="cvss-score" aria-live="polite">
          {s && final !== null ? (
            <>
              <div className={`cvss-box${sev === "Critical" ? " is-critical" : ""}`}>
                <small>{s.temporal !== null ? "Temporal score" : "Base score"}</small>
                <strong className="tnum">{final.toFixed(1)}</strong>
                <span>{sev}</span>
              </div>
              <dl className="cvss-sub tnum">
                <div>
                  <dt>Base</dt>
                  <dd>{s.base.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>Impact</dt>
                  <dd>{s.impact.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>Exploitability</dt>
                  <dd>{s.exploitability.toFixed(1)}</dd>
                </div>
                {s.temporal !== null && (
                  <div>
                    <dt>Temporal</dt>
                    <dd>{s.temporal.toFixed(1)}</dd>
                  </div>
                )}
              </dl>
              <span className="f-label">Vector</span>
              <code className="typed cvss-vector">{vector}</code>
              <div className="gen-row">
                <button type="button" className="btn btn-primary" onClick={() => copy("vector")}>
                  {copied === "vector" ? "Copied" : "Copy vector"}
                </button>
                <button type="button" className="btn" onClick={() => copy("link")}>
                  {copied === "link" ? "Link copied" : "Copy link"}
                </button>
              </div>
            </>
          ) : (
            <div className="cvss-box is-empty">
              <small>Base score</small>
              <strong>–</strong>
              <span className="tnum">
                Pick {missing} more {missing === 1 ? "metric" : "metrics"}
              </span>
            </div>
          )}
          <table className="cvss-scale">
            <caption className="f-label">CVSS 3.1 severity scale</caption>
            <tbody>
              {[
                ["None", "0.0"],
                ["Low", "0.1–3.9"],
                ["Medium", "4.0–6.9"],
                ["High", "7.0–8.9"],
                ["Critical", "9.0–10.0"],
              ].map(([name, range]) => (
                <tr key={name} aria-current={name === sev ? "true" : undefined}>
                  <th scope="row">{name}</th>
                  <td className="typed tnum">{range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </div>
    </div>
  );
}
