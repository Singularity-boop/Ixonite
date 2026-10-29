"use client";

import { useState } from "react";
import { Download } from "../icons";
import { EMAIL_RE, sendForm } from "../submit";
import type { ToolResult } from "./results";

// Email capture in front of the PDF of a tool's results. Like the sample
// report, the download never depends on the mailer succeeding.
export default function ResultsGate({ result }: { result: ToolResult }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setState("invalid");
      return;
    }
    setState("sending");
    await sendForm({
      type: "tool-report",
      email,
      tool: result.tool,
      target: result.target,
      grade: result.grade ?? "",
      summary: result.summary,
    });
    const { downloadReport } = await import("./pdf");
    await downloadReport(result);
    setState("done");
  }

  return (
    <form className="gate" onSubmit={onSubmit} noValidate>
      <div>
        <h3 className="d-md">Get these results as a PDF</h3>
        <p>To share with your team or developers. We&apos;ll also email you if we spot anything worth a closer look.</p>
      </div>
      <div className="bag-form" style={{ marginTop: 0 }}>
        <label htmlFor="gate-email" className="sr-only">
          Work email
        </label>
        <input
          id="gate-email"
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
          aria-describedby="gate-msg"
        />
        <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
          <Download /> {state === "sending" ? "Preparing…" : "Download PDF"}
        </button>
      </div>
      <p id="gate-msg" className="form-msg" role="status">
        {state === "invalid" && "Enter a work email to get the PDF."}
        {state === "done" && "Your PDF has downloaded."}
      </p>
    </form>
  );
}
