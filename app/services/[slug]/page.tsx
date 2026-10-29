import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Motion from "../../components/Motion";
import ReportForm from "../../components/ReportForm";
import { BookingSection, Faq, JsonLd, SiteFooter, SiteHeader, Tape, faqJsonLd } from "../../components/Chrome";
import { ArrowRight, Check, Download } from "../../components/icons";
import { SAMPLE_REPORT_URL, SITE_NAME, SITE_URL } from "../../content";
import { OG_IMAGE } from "../../seo";
import { serviceBySlug, servicePath, services } from "../../services-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  const path = servicePath(s);
  return {
    title: s.seoTitle,
    description: s.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${s.seoTitle} | ${SITE_NAME}`,
      description: s.description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: `${s.seoTitle} | ${SITE_NAME}`, description: s.description, images: [OG_IMAGE.url] },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();
  const url = `${SITE_URL}${servicePath(s)}`;
  const others = services.filter((o) => o.slug !== s.slug);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: s.name,
        serviceType: s.name,
        description: s.description,
        url,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: "Worldwide",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/#exhibits` },
          { "@type": "ListItem", position: 3, name: s.name, item: url },
        ],
      },
    ],
  };

  return (
    <Motion>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd(s.faqs)} />
      <SiteHeader />

      <main id="main">
        <section className="hero">
          <div className="hero-inner">
            <div className="sheet hero-sheet svc-sheet">
              <div className="field hero-desc">
                <nav aria-label="Breadcrumb" className="crumbs" data-fill>
                  <Link href="/">Home</Link>
                  <span aria-hidden>/</span>
                  <Link href="/#exhibits">Services</Link>
                  <span aria-hidden>/</span>
                  <span aria-current="page">{s.name}</span>
                </nav>
                <div className="exhibit-title" data-fill>
                  <span className="marker" data-marker aria-hidden>
                    {s.tag}
                  </span>
                  <h1 className="d-lg">{s.h1}</h1>
                </div>
                <div className="svc-intro" data-fill>
                  {s.intro.map((p) => (
                    <p className="lede" key={p}>
                      {p}
                    </p>
                  ))}
                </div>
                <p className="svc-ctas" data-fill>
                  <a className="btn btn-primary" href="#intake">
                    Book a scoping call <ArrowRight />
                  </a>
                  <a className="btn" href="#report">
                    <Download /> Sample report
                  </a>
                </p>
                <span className="field-cap">
                  Exhibit <b>/ {s.tag}</b>
                </span>
              </div>
              <div className="field hero-side svc-side">
                <h2 className="f-label">Who it&apos;s for</h2>
                <ul className="check-list">
                  {s.whoFor.map((w) => (
                    <li key={w}>
                      <Check />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Tape id="hero" words={["Evidence", "Sealed", "Do not tamper", "Ixonite"]} />
          </div>
        </section>

        <section className="section" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
          <div className="wrap">
            <div className="section-head">
              <h2 className="d-lg">What we test</h2>
              <p className="lede">
                The areas below are where we spend our hours. On the scoping call we adjust them to
                what you actually run.
              </p>
            </div>
            <div className="ledger">
              {s.scope.map((item, i) => (
                <article className="ledger-row ledger-row-3" key={item.title}>
                  <span className="marker marker-sm" data-marker aria-hidden>
                    {i + 1}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="report" className="section bag-band">
          <div className="wrap bag-grid">
            <div>
              <h2 className="d-lg">What you get</h2>
              <ul className="check-list svc-deliver">
                {s.deliverables.map((d) => (
                  <li key={d}>
                    <Check />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="d-md">See a real report layout first</h3>
              <p className="lede" style={{ marginTop: 14 }}>
                Download our sample penetration test report: executive summary, findings with
                evidence, and the retest letter.
              </p>
              <ReportForm />
              <a className="link-arrow" href={SAMPLE_REPORT_URL} download style={{ fontSize: "0.95rem" }}>
                Or download it without an email <Download />
              </a>
            </div>
          </div>
        </section>

        <Faq faqs={s.faqs} title="Common questions" />

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="d-md" style={{ marginBottom: 20 }}>
              Other services
            </h2>
            <ul className="other-svcs">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={servicePath(o)}>
                    <span className="marker marker-sm" aria-hidden>
                      {o.tag}
                    </span>
                    <span>{o.name}</span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <BookingSection defaultService={s.formOption} />
      </main>

      <SiteFooter />
    </Motion>
  );
}
