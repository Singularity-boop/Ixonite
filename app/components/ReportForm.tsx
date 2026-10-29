"use client";

import { useState } from "react";
import { Download } from "./icons";
import { SAMPLE_REPORT_URL } from "../content";
import { EMAIL_RE, sendForm } from "./submit";

// Email capture in front of the sample report. The download never depends
// on the mailer: if the post fails, the visitor still gets the PDF.
export default function ReportForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setState("invalid");
      return;
    }
    setState("sending");
    await sendForm({ type: "sample-report", email });
    const a = document.createElement("a");
    a.href = SAMPLE_REPORT_URL;
    a.download = "Ixonite-sample-pentest-report.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setState("done");
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="bag-form">
        <label htmlFor="report-email" className="sr-only">
          Work email
        </label>
        <input
          id="report-email"
          className="input"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "invalid") setState("idle");
          }}
          aria-invalid={state === "invalid" ? true : undefined}
          aria-describedby="report-msg"
          required
        />
        <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
          <Download /> {state === "sending" ? "Preparing…" : "Get the sample report"}
        </button>
      </div>
      <p id="report-msg" className="form-msg" role="status">
        {state === "invalid" && "Enter a work email so we can send updates to the report."}
        {state === "done" && (
          <>
            Your download has started. If it didn&apos;t,{" "}
            <a href={SAMPLE_REPORT_URL} download>
              download the PDF directly
            </a>
            .
          </>
        )}
        {(state === "idle" || state === "sending") && "PDF download. We only email you about this report, nothing else."}
      </p>
    </form>
  );
}
