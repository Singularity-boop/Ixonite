import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Public_Sans, Courier_Prime } from "next/font/google";
import { JsonLd } from "./components/Chrome";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "./content";
import { services, servicePath } from "./services-data";
import { OG_IMAGE } from "./seo";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
});

const body = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const typed = Courier_Prime({
  variable: "--font-typed",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const description =
  "Ixonite provides manual penetration testing services: web application, network and mobile app pentesting, plus SOC services. Every finding comes with proof and a fix. Book a scoping call or download a sample report.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Penetration Testing Services | Web App, Network & Mobile Pentesting | Ixonite",
    template: "%s | Ixonite",
  },
  description,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Penetration Testing Services | Ixonite",
    description,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Penetration Testing Services | Ixonite",
    description,
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
  category: "Cybersecurity",
};

export const viewport: Viewport = {
  themeColor: "#f2f3ef",
};

// Site-wide structured data: who we are and what we offer.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      email: CONTACT_EMAIL,
      description,
      knowsAbout: [
        "Penetration testing",
        "Web application security",
        "Network security",
        "Mobile application security",
        "Security operations center",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Cybersecurity services",
        itemListElement: services.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            url: `${SITE_URL}${servicePath(s)}`,
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${typed.variable}`}
    >
      <body>
        <JsonLd data={orgJsonLd} />
        {children}
      </body>
    </html>
  );
}
