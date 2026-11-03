import Link from "next/link";
import type { Metadata } from "next";
import { BookingSection, SiteFooter, SiteHeader } from "./components/Chrome";
import { ArrowRight } from "./components/icons";
import { services, servicePath } from "./services-data";
import { toolPath, tools } from "./tools-data";

// Every URL the app doesn't know lands here with a 404 status: old links,
// typos, scanner probes (/wp-admin/, /.env) and removed pages alike.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section">
        <div className="wrap" style={{ display: "grid", gap: 24, justifyItems: "start" }}>
          <p className="typed" style={{ margin: 0, color: "var(--ink-2)" }}>
            Error 404
          </p>
          <h1 className="d-xl">No such exhibit.</h1>
          <p className="lede">The page you asked for isn&apos;t in the file. It may have moved, or the link has a typo.</p>
          <p style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: 0 }}>
            <Link className="btn btn-primary" href="/">
              Back to the home page <ArrowRight />
            </Link>
            <Link className="btn" href="/tools/">
              Free security tools
            </Link>
          </p>
        </div>
        <div className="wrap nf-links">
          <nav aria-label="Services">
            <h2 className="d-md">Services</h2>
            <ul className="other-svcs">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={servicePath(s)}>
                    <span>{s.name}</span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Free tools">
            <h2 className="d-md">Free tools</h2>
            <ul className="other-svcs">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link href={toolPath(t)}>
                    <span>{t.name}</span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      {/* The header and footer "Book a call" buttons jump to #intake, so the 404 page keeps the form. */}
      <BookingSection />
      <SiteFooter />
    </>
  );
}
