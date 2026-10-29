"use client";

import { useState } from "react";
import { ArrowRight } from "./icons";
import { EMAIL_RE, PREFILL_EVENT } from "./submit";

// The hero's working action: take the email here, then hand the visitor to
// the full booking form with it already filled in.
export default function HeroIntake() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email && !EMAIL_RE.test(email)) {
      setError("That email looks incomplete. Check it, or leave it blank and fill in the form below.");
      return;
    }
    setError("");
    window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { email } }));
    document.getElementById("intake")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => document.getElementById("f-name")?.focus({ preventScroll: true }), 600);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="hero-email" className="sr-only">
        Work email
      </label>
      <div className="intake-row">
        <input
          id="hero-email"
          className="input"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "hero-email-err" : undefined}
        />
        <button className="btn btn-primary" type="submit">
          Book a scoping call <ArrowRight />
        </button>
      </div>
      {error && (
        <p id="hero-email-err" className="err" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
