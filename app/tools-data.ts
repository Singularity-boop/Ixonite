// Free security tools. Each one gets its own page so it can rank for the
// search people type ("check dmarc record", "jwt decoder"), and each ends
// with a pentest call to action.

export type ToolPage = {
  slug: string;
  name: string;
  short: string;
  seoTitle: string;
  description: string;
  h1: string;
  intro: string;
  privacy: string;
  cta: { title: string; body: string; service: string };
  faqs: { q: string; a: string }[];
};

export const tools: ToolPage[] = [
  {
    slug: "email-security-checker",
    name: "Email spoofing checker",
    short: "Check SPF, DMARC and DKIM for any domain and see if attackers can send email as you.",
    seoTitle: "Free SPF, DMARC & DKIM Checker: Email Spoofing Test",
    description:
      "Check any domain's SPF, DMARC and DKIM records for free. See whether attackers can send email pretending to be you, and get the exact record to fix it.",
    h1: "Email spoofing checker",
    intro:
      "Enter a domain to see whether its SPF, DMARC and DKIM records stop attackers from sending email that looks like it came from you. Results come with the exact record to add or change.",
    privacy: "Lookups use public DNS through Cloudflare's DNS-over-HTTPS service. Nothing is stored.",
    cta: {
      title: "Phishing works best from your own domain",
      body: "Email is only one way in. A penetration test shows every path an attacker could use against your company, with proof and fixes.",
      service: "Not sure yet",
    },
    faqs: [
      { q: "What is SPF?", a: "Sender Policy Framework is a DNS TXT record that lists which servers may send email for your domain. Receivers check it to spot forged senders." },
      { q: "What is DMARC?", a: "DMARC tells receiving mail servers what to do with email that fails SPF or DKIM checks: deliver it, send it to spam (quarantine) or reject it. Without an enforcing DMARC policy, anyone can send email that appears to come from your domain." },
      { q: "What is DKIM?", a: "DKIM adds a cryptographic signature to outgoing email so receivers can verify it was sent by you and not changed. Keys are published in DNS under a selector name, so this tool checks the most common selectors." },
      { q: "Is p=none enough?", a: "No. p=none only monitors. To actually block spoofed email you need p=quarantine or p=reject once your legitimate senders pass SPF or DKIM." },
    ],
  },
  {
    slug: "password-checker",
    name: "Password breach & strength checker",
    short: "See if a password appears in known breaches, how strong it is, and generate a better one.",
    seoTitle: "Free Password Breach Checker & Strength Test",
    description:
      "Check if a password has appeared in a data breach without sending it anywhere, test how hard it is to crack, and generate a strong replacement. Free and private.",
    h1: "Password breach and strength checker",
    intro:
      "Type a password to see if it appears in known data breaches and roughly how long it would take to crack. Your password never leaves this page.",
    privacy:
      "The password is hashed in your browser. Only the first 5 characters of its SHA-1 hash are sent to Have I Been Pwned (k-anonymity), so neither we nor they ever see the password.",
    cta: {
      title: "Weak passwords are only the start",
      body: "Our testers check login, password reset and session handling on your real applications, the places where account takeovers actually happen.",
      service: "Web application pentest",
    },
    faqs: [
      { q: "Is it safe to type my password here?", a: "Yes. The password is hashed with SHA-1 in your browser and only the first five characters of the hash are sent to the Have I Been Pwned range API. The full password and full hash never leave your device." },
      { q: "What makes a password strong?", a: "Length matters most. A random passphrase of four or more unrelated words, or 16 or more random characters, is far stronger than a short password with symbols. Never reuse passwords between sites." },
      { q: "My password was found in a breach. What now?", a: "Stop using it everywhere, change it to a unique password on every site where you used it, and turn on multi-factor authentication. A password manager makes this easy." },
    ],
  },
  {
    slug: "website-security-checker",
    name: "Website security checker",
    short: "Grade a site's security headers and check its SSL/TLS certificate in one scan.",
    seoTitle: "Free Website Security Checker: Security Headers & SSL Test",
    description:
      "Scan any website's HTTP security headers (HSTS, CSP, X-Frame-Options and more) and SSL/TLS certificate for free. Get a grade and clear fixes for each issue.",
    h1: "Website security checker",
    intro:
      "Enter a website to grade its HTTP security headers and check its SSL/TLS certificate. Each issue comes with what it means and how to fix it.",
    privacy: "We make one request to the site you enter, like a normal browser visit, and use Mozilla's free Observatory for the overall grade. Nothing is stored.",
    cta: {
      title: "Headers are the surface. The real bugs are deeper.",
      body: "Missing headers are easy to spot. Broken access control and business logic flaws are not. Our web application testers find those.",
      service: "Web application pentest",
    },
    faqs: [
      { q: "What are HTTP security headers?", a: "Response headers that tell the browser how to protect your users: force HTTPS (HSTS), limit which scripts may run (Content-Security-Policy), stop your site being framed for clickjacking (X-Frame-Options or frame-ancestors) and more." },
      { q: "Does a good grade mean my site is secure?", a: "No. Headers are a useful baseline, but most serious vulnerabilities live in application logic, authentication and access control. Only a penetration test finds those." },
      { q: "Why does my certificate expiry matter?", a: "An expired certificate makes browsers block your site with a full-page warning. Most outages of this kind are caused by renewals that silently failed." },
    ],
  },
  {
    slug: "jwt-decoder",
    name: "JWT decoder",
    short: "Decode a JSON Web Token and spot common security mistakes, all in your browser.",
    seoTitle: "Free JWT Decoder & Security Checker (Runs in Your Browser)",
    description:
      "Decode JSON Web Tokens instantly in your browser. See the header, payload and expiry, and get warnings for insecure algorithms, missing expiry and sensitive data.",
    h1: "JWT decoder and security check",
    intro:
      "Paste a JSON Web Token to see its header and payload, when it expires, and any common security mistakes. Decoding happens entirely in your browser.",
    privacy: "The token is decoded locally with JavaScript. It is never sent to us or anyone else.",
    cta: {
      title: "JWT bugs lead straight to account takeover",
      body: "Algorithm confusion, weak secrets and missing checks are some of the most common critical findings in our API tests.",
      service: "Web application pentest",
    },
    faqs: [
      { q: "Is it safe to paste a token here?", a: "Decoding runs only in your browser, so the token is not sent anywhere. Still, avoid pasting live production tokens into any website; use a test token where you can." },
      { q: "Does decoding a JWT verify it?", a: "No. Anyone can read a JWT's contents because they are only base64-encoded. Verification checks the signature with the secret or public key, which must happen on your server." },
      { q: "What does alg: none mean?", a: "It means the token is unsigned. If a server accepts alg none, anyone can forge tokens and log in as any user. It should always be rejected." },
    ],
  },
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const toolPath = (t: { slug: string }) => `/tools/${t.slug}/`;
