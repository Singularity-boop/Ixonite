"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "./icons";
import { CONTACT_EMAIL, serviceOptions } from "../content";
import { EMAIL_RE, PREFILL_EVENT, sendForm } from "./submit";

type Errors = Partial<Record<"name" | "email", string>>;

export default function IntakeForm({ defaultService }: { defaultService?: string }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const value = (e as CustomEvent<{ email: string }>).detail?.email;
      if (value) setEmail(value);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(
      [...fd.entries()].map(([k, v]) => [k, String(v).trim()]),
    ) as Record<string, string>;

    const next: Errors = {};
    if (!data.name) next.name = "Add your name so we know who to ask for.";
    if (!EMAIL_RE.test(data.email ?? "")) next.email = "Enter a work email we can reply to.";
    setErrors(next);
    if (Object.keys(next).length) {
      formRef.current?.querySelector<HTMLElement>(next.name ? "#f-name" : "#f-email")?.focus();
      return;
    }

    setState("sending");
    const ok = await sendForm({ type: "booking", ...data });
    setState(ok ? "done" : "failed");
  }

  if (state === "done") {
    return (
      <div className="intake-form" role="status">
        <div className="received">
          <span className="stamp" data-stamp>
            <strong>Received</strong>
            <small>Logged for review</small>
          </span>
          <h3 className="d-md">Thanks. We&apos;ll reply within one working day.</h3>
          <p className="lede">
            A tester will email you to confirm a time for the scoping call. Want to share
            details first? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} className="intake-form" onSubmit={onSubmit} noValidate>
      <div>
        <label className="lbl" htmlFor="f-name">
          Name
        </label>
        <input
          id="f-name"
          name="name"
          className="input"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "f-name-err" : undefined}
        />
        {errors.name && (
          <p id="f-name-err" className="err">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label className="lbl" htmlFor="f-email">
          Work email
        </label>
        <input
          id="f-email"
          name="email"
          type="email"
          className="input"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "f-email-err" : undefined}
        />
        {errors.email && (
          <p id="f-email-err" className="err">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label className="lbl" htmlFor="f-company">
          Company <em>(optional)</em>
        </label>
        <input id="f-company" name="company" className="input" autoComplete="organization" />
      </div>
      <div>
        <label className="lbl" htmlFor="f-service">
          What needs testing
        </label>
        <select id="f-service" name="service" className="input select" defaultValue={defaultService ?? serviceOptions[0]}>
          {serviceOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="lbl" htmlFor="f-date">
          Preferred call date <em>(optional)</em>
        </label>
        <input id="f-date" name="date" type="date" className="input" />
      </div>
      <div>
        <label className="lbl" htmlFor="f-time">
          Time window <em>(optional)</em>
        </label>
        <select id="f-time" name="time" className="input select" defaultValue="Any time">
          <option>Any time</option>
          <option>Morning</option>
          <option>Afternoon</option>
          <option>Evening</option>
        </select>
      </div>
      <div className="full">
        <label className="lbl" htmlFor="f-msg">
          What should we know? <em>(optional: deadline, compliance need, app size)</em>
        </label>
        <textarea id="f-msg" name="message" className="textarea" />
      </div>
      <input className="honey" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      <div className="full submit-row">
        <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Request the call"} <ArrowRight />
        </button>
        <p>We reply within one working day. Your details go to our team only.</p>
      </div>
      {state === "failed" && (
        <p className="err full" role="alert">
          The form couldn&apos;t send just now. Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Scoping%20call%20request`}>{CONTACT_EMAIL}</a>{" "}
          and we&apos;ll set up the call from there.
        </p>
      )}
    </form>
  );
}
