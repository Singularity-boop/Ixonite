// Parts shared by every page: header, footer, booking section, FAQ, JSON-LD.
import Link from "next/link";
import IntakeForm from "./IntakeForm";
import { ArrowRight, Download, Mark } from "./icons";
import { CONTACT_EMAIL, SAMPLE_REPORT_URL, nav } from "../content";
import { services, servicePath } from "../services-data";

export function Tape({ id, words }: { id: string; words: string[] }) {
  const run = Array.from({ length: 4 }, () => words).flat();
  return (
    <div className="tape" data-tape={id} aria-hidden>
      <div className="tape-inner" style={{ display: "flex" }}>
        {[0, 1].map((k) => (
          <div className="tape-track" key={k}>
            {run.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function SiteHeader() {
  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <header className="site-head">
        <div className="wrap">
          <Link href="/" className="brand" aria-label="Ixonite home">
            <Mark className="brand-mark" />
            <span className="brand-name">Ixonite</span>
          </Link>
          <nav className="head-nav" aria-label="Main">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <a href="#intake" className="btn btn-primary head-cta">
            Book a call
          </a>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <Tape id="foot" words={["Case closed", "Evidence delivered", "Ixonite"]} />
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <h2 className="d-md" style={{ maxWidth: "14ch" }}>
              Find it before someone else does.
            </h2>
            <p style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="#intake">
                Book a scoping call <ArrowRight />
              </a>
              <a
                className="btn"
                href={SAMPLE_REPORT_URL}
                download
                style={{ background: "transparent", borderColor: "var(--paper)", color: "var(--paper)" }}
              >
                <Download /> Sample report
              </a>
            </p>
          </div>
          <nav aria-label="Services">
            <p className="foot-h">Services</p>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={servicePath(s)}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="foot-h">Contact</p>
            <ul>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                <a href="#intake">Book a call</a>
              </li>
              <li>
                <Link href="/#handlers">Team</Link>
              </li>
              <li>
                <Link href="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-base">
          <span>© {new Date().getFullYear()} Ixonite · ixonit.com</span>
          <span>Testing only ever happens with written authorization from the system owner.</span>
        </div>
      </div>
    </footer>
  );
}

export function BookingSection({
  title = "Book a scoping call",
  defaultService,
}: {
  title?: string;
  defaultService?: string;
}) {
  return (
    <section id="intake" className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head">
          <h2 className="d-lg">{title}</h2>
          <p className="lede">
            Thirty minutes with a tester. We learn what you need tested and why, and you leave
            with a scope, a timeline and a fixed quote.
          </p>
        </div>
        <div className="intake">
          <aside className="intake-side">
            <dl>
              <div>
                <dt>Call length</dt>
                <dd>30 minutes, video or phone</dd>
              </div>
              <div>
                <dt>You&apos;ll get</dt>
                <dd>Scope, timeline and a fixed quote</dd>
              </div>
              <div>
                <dt>Email us directly</dt>
                <dd>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </dd>
              </div>
            </dl>
            <a className="link-arrow" href={SAMPLE_REPORT_URL} download>
              Sample report (PDF) <Download />
            </a>
          </aside>
          <IntakeForm defaultService={defaultService} />
        </div>
      </div>
    </section>
  );
}

export function Faq({
  faqs,
  title = "Questions buyers ask",
}: {
  faqs: { q: string; a: string }[];
  title?: string;
}) {
  return (
    <section id="faq" className="section">
      <div className="wrap faq-grid">
        <h2 className="d-lg">{title}</h2>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <h3>{f.q}</h3>
                <span className="faq-sign" aria-hidden />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
