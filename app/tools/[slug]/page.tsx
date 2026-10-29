import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Motion from "../../components/Motion";
import { BookingSection, Faq, JsonLd, SiteFooter, SiteHeader, faqJsonLd } from "../../components/Chrome";
import { ArrowRight, Download } from "../../components/icons";
import EmailSecurity from "../../components/tools/EmailSecurity";
import JwtDecoder from "../../components/tools/JwtDecoder";
import PasswordCheck from "../../components/tools/PasswordCheck";
import SiteScan from "../../components/tools/SiteScan";
import { SAMPLE_REPORT_URL, SITE_NAME, SITE_URL } from "../../content";
import { OG_IMAGE } from "../../seo";
import { toolBySlug, toolPath, tools } from "../../tools-data";

const widgets: Record<string, () => React.ReactNode> = {
  "email-security-checker": () => <EmailSecurity />,
  "password-checker": () => <PasswordCheck />,
  "website-security-checker": () => <SiteScan />,
  "jwt-decoder": () => <JwtDecoder />,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(slug);
  if (!t) return {};
  const path = toolPath(t);
  return {
    title: t.seoTitle,
    description: t.description,
    alternates: { canonical: path },
    openGraph: { title: `${t.seoTitle} | ${SITE_NAME}`, description: t.description, url: path, siteName: SITE_NAME, type: "website", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${t.seoTitle} | ${SITE_NAME}`, description: t.description, images: [OG_IMAGE.url] },
  };
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const t = toolBySlug(slug);
  if (!t) notFound();
  const url = `${SITE_URL}${toolPath(t)}`;
  const others = tools.filter((o) => o.slug !== t.slug);

  const appJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: t.name,
        url,
        description: t.description,
        applicationCategory: "SecurityApplication",
        operatingSystem: "Any (runs in the browser)",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Free tools", item: `${SITE_URL}/tools/` },
          { "@type": "ListItem", position: 3, name: t.name, item: url },
        ],
      },
    ],
  };

  return (
    <Motion>
      <JsonLd data={appJsonLd} />
      <JsonLd data={faqJsonLd(t.faqs)} />
      <SiteHeader />

      <main id="main">
        <section className="tool-hero">
          <div className="wrap">
            <div className="sheet tool-sheet">
              <div className="field tool-intro">
                <nav aria-label="Breadcrumb" className="crumbs">
                  <Link href="/">Home</Link>
                  <span aria-hidden>/</span>
                  <Link href="/tools/">Free tools</Link>
                  <span aria-hidden>/</span>
                  <span aria-current="page">{t.name}</span>
                </nav>
                <h1 className="d-lg">{t.h1}</h1>
                <p className="lede">{t.intro}</p>
              </div>
              <div className="field tool-body">
                {widgets[t.slug]()}
                <p className="tool-privacy typed">{t.privacy}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section finding-band tool-cta">
          <div className="wrap section-head" style={{ marginBottom: 0 }}>
            <h2 className="d-lg" style={{ color: "var(--paper)" }}>
              {t.cta.title}
            </h2>
            <div>
              <p className="lede">{t.cta.body}</p>
              <p style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a className="btn btn-primary" href="#intake">
                  Book a scoping call <ArrowRight />
                </a>
                <a className="btn tool-cta-ghost" href={SAMPLE_REPORT_URL} download>
                  <Download /> Sample pentest report
                </a>
              </p>
            </div>
          </div>
        </section>

        <Faq faqs={t.faqs} title="Common questions" />

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="d-md" style={{ marginBottom: 20 }}>
              More free tools
            </h2>
            <ul className="other-svcs">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={toolPath(o)}>
                    <span>{o.name}</span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <BookingSection defaultService={t.cta.service} />
      </main>

      <SiteFooter />
    </Motion>
  );
}
