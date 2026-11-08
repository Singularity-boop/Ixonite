import nodemailer from "nodemailer";

// Form mailer: booking requests, sample-report downloads and tool leads.
// Configure in the host's environment variables:
//   SMTP_HOST (default smtp.hostinger.com), SMTP_PORT (default 465),
//   SMTP_USER, SMTP_PASS, MAIL_TO (default contact@ixonit.com)
// Without SMTP credentials every submission is still written to the server
// log, so no lead is lost.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPES = {
  booking: "Scoping call request",
  "sample-report": "Sample report download",
  "tool-report": "Free tool results download",
} as const;

const clean = (v: FormDataEntryValue | null, max = 2000) =>
  String(v ?? "").replace(/[\r\0]/g, "").trim().slice(0, max);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

export async function POST(request: Request) {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field.
  if (clean(fd.get("website"))) return Response.json({ ok: true });

  const rawType = clean(fd.get("type"), 40);
  const type = (rawType in TYPES ? rawType : "booking") as keyof typeof TYPES;
  const email = clean(fd.get("email"), 200);
  if (!EMAIL_RE.test(email)) return Response.json({ ok: false, error: "invalid_email" }, { status: 422 });

  const lines = [`Type:     ${TYPES[type]}`, `Email:    ${email}`];
  if (type === "booking") {
    lines.push(
      `Name:     ${clean(fd.get("name"), 200)}`,
      `Company:  ${clean(fd.get("company"), 200)}`,
      `Service:  ${clean(fd.get("service"), 100)}`,
      `Date:     ${clean(fd.get("date"), 40)}`,
      `Time:     ${clean(fd.get("time"), 40)}`,
      "",
      clean(fd.get("message"), 5000),
    );
  }
  if (type === "tool-report") {
    lines.push(
      `Tool:     ${clean(fd.get("tool"), 100)}`,
      `Target:   ${clean(fd.get("target"), 300)}`,
      `Grade:    ${clean(fd.get("grade"), 10)}`,
      `Summary:  ${clean(fd.get("summary"), 500)}`,
    );
  }
  lines.push("", `Sent ${new Date().toISOString()}`);

  const subject = oneLine(
    type === "booking"
      ? `Scoping call request from ${email}`
      : type === "sample-report"
        ? `Sample report downloaded by ${email}`
        : `Tool lead: ${clean(fd.get("tool"), 100)} on ${clean(fd.get("target"), 100)} by ${email}`,
  );

  console.log("[lead]", JSON.stringify({ type, email, subject }));

  const env = (k: string) => process.env[k]?.trim() || undefined;
  const SMTP_USER = env("SMTP_USER");
  const SMTP_PASS = process.env.SMTP_PASS;
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[lead] SMTP_USER/SMTP_PASS not set; email not sent");
    return Response.json({ ok: false, error: "mail_not_configured" });
  }

  try {
    const port = Number(env("SMTP_PORT") ?? 465);
    const transport = nodemailer.createTransport({
      host: env("SMTP_HOST") ?? "smtp.hostinger.com",
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 15000,
    });
    await transport.sendMail({
      from: `Ixonite website <${SMTP_USER}>`,
      to: env("MAIL_TO") ?? "contact@ixonit.com",
      replyTo: email,
      subject,
      text: lines.join("\n"),
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[lead] mail failed", e);
    // Short, secret-free reason (e.g. EAUTH 535, ETIMEDOUT, EDNS) to debug delivery.
    const err = e as { code?: string; responseCode?: number; command?: string };
    const reason = [err.code, err.responseCode, err.command].filter(Boolean).join(" ") || "unknown";
    return Response.json({ ok: false, error: "mail_failed", reason });
  }
}
