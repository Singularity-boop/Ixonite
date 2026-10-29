import Link from "next/link";
import HeroIntake from "./components/HeroIntake";
import Motion from "./components/Motion";
import ReportForm from "./components/ReportForm";
import { BookingSection, Faq, JsonLd, SiteFooter, SiteHeader, Tape, faqJsonLd } from "./components/Chrome";
import { Alert, ArrowRight, Check, Download, LinkedIn, SealClosed } from "./components/icons";
import { custodyLog, homeFaqs, leadService, otherServices, team } from "./content";
import { servicePath } from "./services-data";
import { toolPath, tools } from "./tools-data";

export default function Home() {
  return (
    <Motion>
      <JsonLd data={faqJsonLd(homeFaqs)} />
      <SiteHeader />

      <main id="main">
        {/* ---------- Hero: the custody form ---------- */}
        <section id="top" className="hero">
          <div className="hero-inner">
            <div className="sheet hero-sheet">
              <div className="field hero-desc">
                <h1 className="d-xl" data-fill>
                  We break in.
                  <br />
                  You get the evidence.
                </h1>
                <p className="lede" data-fill>
                  Ixonite runs manual penetration tests on your web apps, APIs, networks and
                  mobile apps. Every finding comes back with the request that proved it, what an
                  attacker could do with it, and the exact fix.
                </p>
                <span className="field-cap">
                  Description of work <b>/ 01</b>
                </span>
              </div>

              <dl className="hero-side">
                <div className="field" data-fill>
                  <dt>Case no.</dt>
                  <dd className="case-no tnum">
                    IXN-26-<span className="blank">&nbsp;</span>
                  </dd>
                  <span className="field-cap">yours</span>
                </div>
                <div className="field" data-fill>
                  <dt>Scope</dt>
                  <dd>Web apps · APIs · Networks · Mobile · SOC</dd>
                </div>
                <div className="field" data-fill>
                  <dt>Handled by</dt>
                  <dd>Human testers, not just a scanner</dd>
                </div>
                <div className="field" data-fill>
                  <dt>You receive</dt>
                  <dd>A report your engineers can fix from, and a retest</dd>
                </div>
              </dl>

              <div className="field hero-intake">
                <div data-fill>
                  <HeroIntake />
                </div>
                <div className="hero-alt" data-fill>
                  <span>Not ready to talk?</span>
                  <a className="link-arrow" href="#report">
                    Read a sample report first <Download />
                  </a>
                </div>
              </div>
            </div>
            <Tape id="hero" words={["Evidence", "Sealed", "Do not tamper", "Ixonite"]} />
          </div>
        </section>

        {/* ---------- Services as exhibits ---------- */}
        <section id="exhibits" className="section" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
          <div className="wrap">
            <div className="section-head">
              <h2 className="d-lg">Penetration testing services</h2>
              <p className="lede">
                Web applications are where most breaches start, so that is where we put most of
                our hours. The same evidence-first report covers everything else we test.
              </p>
            </div>

            <article className="exhibit-lead" id={leadService.id}>
              <div>
                <div className="exhibit-title">
                  <span className="marker" data-marker aria-label={`Exhibit ${leadService.tag}`}>
                    {leadService.tag}
                  </span>
                  <h3 className="d-md">{leadService.name}</h3>
                </div>
                <p className="lede" style={{ color: "var(--ink)" }}>
                  {leadService.summary}
                </p>
                <p style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a className="btn btn-primary" href="#intake">
                    Scope a web app test <ArrowRight />
                  </a>
                  <Link className="btn" href={servicePath(leadService)}>
                    How we test web apps
                  </Link>
                </p>
              </div>
              <div>
                <h4 className="f-label" style={{ marginBottom: 4 }}>
                  What testers go after
                </h4>
                <ul className="check-list">
                  {leadService.covers.map((c) => (
                    <li key={c}>
                      <Check />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <div className="ledger">
              {otherServices.map((s) => (
                <article className="ledger-row" key={s.id} id={s.id}>
                  <span className="marker marker-sm" data-marker aria-label={`Exhibit ${s.tag}`}>
                    {s.tag}
                  </span>
                  <h3>{s.name}</h3>
                  <div>
                    <p>{s.summary}</p>
                    <Link className="link-arrow ledger-more" href={servicePath(s)}>
                      {s.name} in detail <ArrowRight />
                    </Link>
                  </div>
                  <ul className="ledger-tags" aria-label="Covers">
                    {s.covers.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Sample finding ---------- */}
        <section id="finding" className="section finding-band">
          <div className="wrap">
            <div className="section-head">
              <h2 className="d-lg" style={{ color: "var(--paper)" }}>
                This is what a finding looks like
              </h2>
              <div>
                <p className="lede">
                  No vague &ldquo;potential risk&rdquo; lines. Each finding shows the exact request,
                  the proof, the business impact and the fix, so your engineers can act on it the
                  same day.
                </p>
                <p style={{ marginTop: 20 }}>
                  <a className="link-arrow" href="#report" style={{ color: "var(--marker)" }}>
                    Get the full sample report <Download />
                  </a>
                </p>
              </div>
            </div>

            <article className="finding-doc" aria-label="Sample finding A-03">
              <div className="field f-title">
                <span className="f-label">Finding A-03 · Web application</span>
                <h3>Any user can read any other customer&apos;s invoices</h3>
                <p>
                  The invoice API checks that you are signed in, but not that the invoice belongs
                  to you. Changing the number in the URL returns another company&apos;s invoice.
                </p>
              </div>
              <div className="field f-sev">
                <span className="f-label">Severity</span>
                <span className="sev">
                  <Alert /> Critical
                </span>
                <span className="cvss tnum">CVSS 3.1 · 8.6</span>
                <span className="cvss">Broken access control (IDOR)</span>
                <span className="stamp" data-stamp>
                  <strong>Retested</strong>
                  <small>Fix verified</small>
                </span>
              </div>
              <div className="field f-evidence">
                <span className="f-label">Evidence</span>
                <pre className="http" tabIndex={0} aria-label="HTTP request and response">
{`GET /api/v2/invoices/`}<mark>48213</mark>{` HTTP/1.1
Host: app.example-client.com
Authorization: Bearer eyJhbGciOi…`}<span className="dim">{`  (signed in as tenant 1102)`}</span>{`

HTTP/1.1 200 OK
{ "invoice_id": 48213, "tenant_id": `}<mark>2271</mark>{`, "total": "14,920.00",
  "billing_email": "ap@`}<span className="dim">{`[redacted]`}</span>{`", "bank_iban": "`}<span className="dim">{`[redacted]`}</span>{`" }`}
                </pre>
              </div>
              <div className="field f-impact">
                <span className="f-label">Impact</span>
                <p>
                  An attacker with a free trial account can download every customer&apos;s
                  invoices, including bank details, by counting through invoice numbers.
                </p>
              </div>
              <div className="field f-fix">
                <span className="f-label">Fix</span>
                <p>
                  Look up invoices by both <code className="typed">invoice_id</code> and the
                  signed-in user&apos;s <code className="typed">tenant_id</code>, and return 404
                  when they don&apos;t match. Add a test that requests another tenant&apos;s
                  invoice.
                </p>
              </div>
            </article>

            <p className="synthetic-note">
              Synthetic example written for this page. Real client findings are never published.
            </p>
          </div>
        </section>

        {/* ---------- Method: custody log ---------- */}
        <section id="method" className="section">
          <div className="wrap">
            <div className="section-head">
              <h2 className="d-lg">From scoping call to retest</h2>
              <p className="lede">
                A typical two-week web application test. You know who is handling your systems and
                what they are doing at every step.
              </p>
            </div>
            <table className="log">
              <caption>
                Timings are for a typical web application. Larger scopes take longer; we confirm
                dates on the scoping call.
              </caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Handled by</th>
                  <th scope="col">What happens</th>
                  <th scope="col">
                    <span className="sr-only">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {custodyLog.map((r) => (
                  <tr key={r.when} data-log-row>
                    <td>
                      <span data-type style={{ display: "inline-block" }}>
                        {r.when}
                      </span>
                    </td>
                    <td>
                      <span data-type style={{ display: "inline-block" }}>
                        {r.handler}
                      </span>
                    </td>
                    <td>
                      <span data-type style={{ display: "inline-block" }}>
                        {r.action}
                      </span>
                    </td>
                    <td>
                      <SealClosed className="seal-dot" data-seal />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- Sample report: the evidence bag ---------- */}
        <section id="report" className="section bag-band">
          <div className="wrap bag-grid">
            <div>
              <h2 className="d-lg">Read the report before you hire us</h2>
              <p className="lede" style={{ marginTop: 20 }}>
                Most buyers judge a pentest firm by its report. Ours shows the executive summary
                your board reads, the findings your engineers fix from, and the retest letter your
                customers and auditors ask for.
              </p>
              <ReportForm />
            </div>
            <div className="bag" data-bag aria-hidden>
              <div className="bag-zip" />
              <div className="bag-doc">
                <span className="doc-title">
                  Penetration
                  <br />
                  test report
                </span>
                <span className="doc-line" />
                <span className="doc-line short" />
                <span className="doc-sev">
                  <i style={{ background: "var(--seal)", color: "#fff", borderColor: "var(--seal)" }}>
                    1 CRIT
                  </i>
                  <i>2 HIGH</i>
                  <i>4 MED</i>
                  <i>3 LOW</i>
                </span>
                <span className="doc-line" />
                <span className="doc-line" />
                <span className="doc-line short" />
              </div>
              <div className="bag-seal">Evidence · Sealed · Ixonite</div>
              <div className="bag-label">
                <b>Sample report</b>
                Item: synthetic web app test
                <br />
                Format: PDF
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Team ---------- */}
        <section id="handlers" className="section">
          <div className="wrap">
            <div className="section-head">
              <h2 className="d-lg">Who handles your systems</h2>
              <p className="lede">
                You talk to the people who test your application, before, during and after. Check
                their backgrounds yourself.
              </p>
            </div>
            <div className="badges">
              {team.map((m, i) => (
                <article className="badge" key={i} data-badge>
                  <span className="badge-slot" aria-hidden />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="badge-photo" src={m.photo} alt={`Photo of ${m.name}`} width={400} height={400} loading="lazy" />
                  <div>
                    <h3>{m.name}</h3>
                    <p>{m.role}</p>
                  </div>
                  <div className="badge-strip">
                    <span className="tnum">ID IXN-{String(i + 1).padStart(3, "0")}</span>
                    <a className="badge-li" href={m.linkedin} target="_blank" rel="noopener noreferrer">
                      <LinkedIn /> <span>LinkedIn</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="tools" className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <h2 className="d-lg">Free security checks</h2>
              <p className="lede">
                Run the quick checks our testers start with. Free, instant, and nothing you enter is
                stored.
              </p>
            </div>
            <ul className="other-svcs other-svcs-2">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link href={toolPath(t)}>
                    <span>
                      {t.name}
                      <small>{t.short}</small>
                    </span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Faq faqs={homeFaqs} />

        <BookingSection />
      </main>

      <SiteFooter />
    </Motion>
  );
}
