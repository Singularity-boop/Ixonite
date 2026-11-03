"use client";

import { useState } from "react";
import { ArrowRight } from "../icons";
import { SAMPLE, analyse, formatDelay } from "./emailHeaders";
import { ResultList } from "./results";

type Out = ReturnType<typeof analyse>;

export default function EmailHeaders() {
  const [raw, setRaw] = useState("");
  const [out, setOut] = useState<Out | null>(null);
  const [error, setError] = useState("");

  function run(text: string) {
    if (!text.trim()) {
      setError("Paste the headers of an email first.");
      setOut(null);
      return;
    }
    try {
      setOut(analyse(text));
      setError("");
    } catch (e) {
      setOut(null);
      setError(e instanceof Error ? e.message : "These headers couldn't be read.");
    }
  }

  return (
    <div className="tool">
      <form
        className="tool-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(raw);
        }}
      >
        <label className="lbl" htmlFor="t-headers">
          Email headers
        </label>
        <textarea
          id="t-headers"
          className="textarea typed eh-input"
          spellCheck={false}
          placeholder={"Received: from mail.example.com (mail.example.com [203.0.113.10])\n        by mx.yourcompany.com with ESMTPS id ...\nAuthentication-Results: ...\nFrom: ...\nSubject: ..."}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            if (error) setError("");
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "t-headers-err" : "t-headers-help"}
        />
        <p id="t-headers-help" className="eh-help">
          Gmail: open the email, ⋮ menu, <b>Show original</b>. Outlook: open the email, … menu, <b>View</b> →{" "}
          <b>View message details</b>. Apple Mail: <b>View</b> → <b>Message</b> → <b>All Headers</b>.
        </p>
        {error && (
          <p id="t-headers-err" className="err" role="alert">
            {error}
          </p>
        )}
        <div className="gen-row" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" type="submit">
            Analyze headers <ArrowRight />
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setRaw(SAMPLE);
              run(SAMPLE);
            }}
          >
            Try a phishing sample
          </button>
        </div>
      </form>

      {out && (
        <>
          <ResultList result={out.result} />

          {out.hops.length > 0 && (
            <div>
              <h2 className="d-md" style={{ marginBottom: 14 }}>
                Delivery path
              </h2>
              <table className="log eh-hops">
                <caption>Oldest hop first. Times come from each server&apos;s own clock, so small gaps can be clock drift.</caption>
                <thead>
                  <tr>
                    <th scope="col">Hop</th>
                    <th scope="col">Received</th>
                    <th scope="col">From → by</th>
                    <th scope="col">Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {out.hops.map((hop, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="tnum">{hop.date ? hop.date.toISOString().replace("T", " ").slice(0, 19) + " UTC" : "–"}</td>
                      <td className="eh-route">
                        {hop.from ?? "(unnamed)"}
                        {hop.ip && !hop.from?.includes(hop.ip) ? ` [${hop.ip}]` : ""}
                        <span className="dim"> → </span>
                        {hop.by ?? "(unknown)"}
                        {hop.with ? <span className="dim"> · {hop.with}</span> : null}
                      </td>
                      <td className="tnum">{i === 0 ? "–" : formatDelay(hop.delay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {out.fields.length > 0 && (
            <div>
              <h2 className="d-md" style={{ marginBottom: 14 }}>
                Key headers
              </h2>
              <dl className="eh-fields">
                {out.fields.map((f) => (
                  <div key={f.name}>
                    <dt>{f.name}</dt>
                    <dd className="typed">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}
    </div>
  );
}
