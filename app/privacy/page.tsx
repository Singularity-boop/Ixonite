import type { Metadata } from "next";
import Link from "next/link";
import { BookingSection, SiteFooter, SiteHeader } from "../components/Chrome";
import { CONTACT_EMAIL, PRIVACY_UPDATED, SITE_NAME } from "../content";
import { OG_IMAGE } from "../seo";

// Written from what this site's code actually does (forms in app/components,
// tools in app/components/tools, app/api). Update it whenever that changes,
// e.g. when adding analytics. PLACEHOLDER: have it reviewed, and set a real
// retention period, before relying on it legally.

const title = "Privacy Policy";
const description = "What Ixonite collects through ixonit.com, why, who it is shared with, and how to ask us to delete it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy/" },
  openGraph: { title: `${title} | ${SITE_NAME}`, description, url: "/privacy/", siteName: SITE_NAME, type: "website", images: [OG_IMAGE] },
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
        <article className="wrap prose">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">Privacy policy</span>
          </nav>
          <h1 className="d-lg">Privacy policy</h1>
          <p className="lede">
            We collect as little as we can: what you type into our forms, so we can reply. Most of our free tools run
            entirely in your browser and send us nothing.
          </p>
          <p className="typed prose-meta">Last updated: {PRIVACY_UPDATED}</p>

          <h2 className="d-md">Who we are</h2>
          <p>
            {SITE_NAME} provides penetration testing and security services through ixonit.com. For anything about your
            data, email {mail}.
          </p>

          <h2 className="d-md">What we collect and why</h2>
          <ul>
            <li>
              <b>Booking a scoping call:</b> your name, work email, and optionally your company, what needs testing, a
              preferred date and time, and your message. We use them to reply and arrange the call.
            </li>
            <li>
              <b>Downloading the sample report:</b> your work email, so we know who asked and can follow up once.
            </li>
            <li>
              <b>Downloading a tool&apos;s results as a PDF:</b> your work email, plus the tool name, what was checked
              (for example a domain, a website or a test scope), and the grade and summary. We use them to follow up if
              something looks worth a closer look.
            </li>
          </ul>
          <p>
            Form submissions are emailed to our team and also written to our server&apos;s log, so a request isn&apos;t
            lost if email fails. We process this information because you asked us to contact you, and for our
            legitimate interest in answering enquiries about our services.
          </p>

          <h2 className="d-md">What our free tools do with what you enter</h2>
          <ul>
            <li>
              <b>Run only in your browser, nothing sent:</b> password generator, JWT decoder, CVSS calculator, email
              header analyzer and pentest cost calculator (unless you ask for its PDF or a quote, see above).
            </li>
            <li>
              <b>Password checker:</b> the password is hashed in your browser and only the first 5 characters of the
              hash go to Have I Been Pwned. Neither we nor they see the password.
            </li>
            <li>
              <b>Email spoofing checker:</b> your browser looks up the domain&apos;s DNS records through
              Cloudflare&apos;s public DNS-over-HTTPS service.
            </li>
            <li>
              <b>Website security checker:</b> the website address goes to our server, which makes one request to that
              site and returns its headers and certificate details. Your browser also sends the address to Mozilla
              Observatory for its grade. We don&apos;t store what you check.
            </li>
          </ul>

          <h2 className="d-md">Logs, cookies and tracking</h2>
          <p>
            Like any website, our hosting provider keeps standard server logs, such as IP address, page requested and
            time. To stop abuse of the website checker, our server keeps your IP address in memory for up to 10
            minutes. This site sets no cookies and uses no analytics or advertising trackers.
          </p>

          <h2 className="d-md">Who we share it with</h2>
          <p>
            Hostinger hosts this website and our email, so it processes the data above on our behalf. The tools send
            only what is described above to Have I Been Pwned, Cloudflare and Mozilla. We don&apos;t sell your data or
            share it with anyone else unless the law requires it.
          </p>

          <h2 className="d-md">How long we keep it</h2>
          <p>
            We keep enquiries for as long as we need them to reply, arrange and deliver work you ask for, and keep
            business records. When we no longer need them, we delete them. You can ask us to delete yours at any time.
          </p>

          <h2 className="d-md">Your rights</h2>
          <p>
            You can ask for a copy of the data we hold about you, ask us to correct or delete it, or object to how we
            use it. Email {mail} and we&apos;ll reply within 30 days. You can also complain to your local data
            protection authority.
          </p>

          <h2 className="d-md">Security</h2>
          <p>
            Everything you send us travels over HTTPS. Found a security issue in this website? Report it to {mail}; our{" "}
            <a href="/.well-known/security.txt">security.txt</a> has the details.
          </p>

          <h2 className="d-md">Changes</h2>
          <p>If we change how we handle data, we&apos;ll update this page and the date at the top.</p>
        </article>
      </main>
      {/* Header and footer "Book a call" buttons jump to #intake on every page. */}
      <BookingSection />
      <SiteFooter />
    </>
  );
}
