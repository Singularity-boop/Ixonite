import type { Metadata } from "next";
import Link from "next/link";
import Motion from "../components/Motion";
import { BookingSection, JsonLd, SiteFooter, SiteHeader } from "../components/Chrome";
import { ArrowRight } from "../components/icons";
import { SITE_NAME, SITE_URL } from "../content";
import { OG_IMAGE } from "../seo";
import { toolPath, tools } from "../tools-data";

const title = "Free Cybersecurity Tools: Email, Password, Website & JWT Checks";
const description =
  "Free security tools from Ixonite's penetration testers: check SPF, DMARC and DKIM, test passwords against breaches, scan website security headers and SSL, and decode JWTs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/" },
  openGraph: { title: `${title} | ${SITE_NAME}`, description, url: "/tools/", siteName: SITE_NAME, type: "website", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: [OG_IMAGE.url] },
};

export default function ToolsHub() {
  return (
    <Motion>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Free cybersecurity tools",
          itemListElement: tools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE_URL}${toolPath(t)}` })),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="section" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
          <div className="wrap">
            <div className="section-head">
              <h1 className="d-lg">Free security tools</h1>
              <p className="lede">
                Quick checks our testers use every day, free for anyone. They run in your browser
                or with a single request, and we don&apos;t store what you check.
              </p>
            </div>
            <div className="ledger">
              {tools.map((t, i) => (
                <article className="ledger-row ledger-row-3" key={t.slug}>
                  <span className="marker marker-sm" data-marker aria-hidden>
                    {i + 1}
                  </span>
                  <h2>
                    <Link href={toolPath(t)} className="tool-link">
                      {t.name}
                    </Link>
                  </h2>
                  <div>
                    <p>{t.short}</p>
                    <Link className="link-arrow ledger-more" href={toolPath(t)}>
                      Use the tool <ArrowRight />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <BookingSection title="Want more than a quick check?" />
      </main>
      <SiteFooter />
    </Motion>
  );
}
