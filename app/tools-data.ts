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

const allTools: ToolPage[] = [
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
  {
    slug: "penetration-testing-cost-calculator",
    name: "Pentest cost calculator",
    short: "Estimate how many tester-days your penetration test needs, then turn it into a fixed quote.",
    seoTitle: "Penetration Testing Cost Calculator: Estimate Your Pentest",
    description:
      "Estimate the cost of a penetration test from your scope: web app, API, mobile app and network. See tester-days, timeline and what drives pentest pricing. Free.",
    h1: "Penetration testing cost calculator",
    intro:
      "Pick what needs testing to see how many tester-days a manual penetration test takes and how long it runs. Pentest prices are effort times a day rate, so effort is the number behind every quote.",
    privacy: "The estimate is calculated in your browser. Nothing is sent unless you ask for the PDF or a quote.",
    cta: {
      title: "Estimates are a start. Our quotes are fixed.",
      body: "On a 30-minute scoping call we confirm the scope with you and send a fixed price that won't change once testing starts.",
      service: "Not sure yet",
    },
    faqs: [
      { q: "How much does a penetration test cost?", a: "Pentest pricing is effort multiplied by a day rate. The effort depends on what is in scope: the size of the application, the number of user roles, API endpoints, IP addresses and hosts. A small web app can need less than a week of testing, while a large app with several roles and an API can need several weeks." },
      { q: "What makes a pentest cost more?", a: "More pages, user roles, API endpoints and hosts all add testing time. Every user role needs its own access control testing, which is where many serious bugs hide. Compliance work, such as PCI DSS segmentation testing, adds days too." },
      { q: "How accurate is this estimate?", a: "It gives a starting range based on typical engagements. The real effort depends on details like how complex the business logic is, whether test accounts are ready, and which environment is tested. The scoping call turns it into a fixed quote." },
      { q: "Why not just run a cheaper automated scan?", a: "Scanners find known, surface-level issues. They can't tell whether one customer can read another customer's data, or whether your business logic can be abused. That's why auditors and enterprise customers usually ask for a manual penetration test." },
    ],
  },
  {
    slug: "cvss-calculator",
    name: "CVSS 3.1 calculator",
    short: "Score a vulnerability with CVSS 3.1, get the vector string, and share the result as a link.",
    seoTitle: "CVSS 3.1 Calculator: Score Vulnerabilities & Vector Strings",
    description:
      "Free CVSS v3.1 calculator. Pick the base and temporal metrics to get the score, severity and vector string, or paste a vector to decode it. Plain-English help for every metric.",
    h1: "CVSS 3.1 calculator",
    intro:
      "Choose each metric to score a vulnerability, or paste a vector string to decode one. Every option is explained in plain English, and the page link updates so you can share the exact score.",
    privacy: "Scores are calculated in your browser with the FIRST CVSS v3.1 formulas. Nothing is sent or stored.",
    cta: {
      title: "A score is only as good as the finding",
      body: "Every finding in our reports comes with a CVSS score, proof that it's exploitable, and a specific fix your developers can act on.",
      service: "Web application pentest",
    },
    faqs: [
      { q: "What is CVSS?", a: "The Common Vulnerability Scoring System, maintained by FIRST, rates how severe a vulnerability is on a scale from 0 to 10. The score is built from metrics such as how the attack is carried out, which privileges it needs, and its impact on confidentiality, integrity and availability." },
      { q: "What do CVSS scores mean?", a: "0.0 is None, 0.1 to 3.9 is Low, 4.0 to 6.9 is Medium, 7.0 to 8.9 is High and 9.0 to 10.0 is Critical." },
      { q: "What is a CVSS vector string?", a: "A compact record of every metric choice, such as CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H. It lets anyone recalculate and check a score, so it should always be published next to the number." },
      { q: "What does Scope: Changed mean?", a: "The vulnerability lets an attacker affect something beyond the vulnerable component itself. Cross-site scripting that runs in users' browsers and escaping a container to its host are common examples." },
      { q: "Does this calculator support CVSS 4.0?", a: "Not yet. It scores CVSS 3.1, which is still widely used in pentest reports, scanners and vulnerability databases. If you paste a 4.0 vector, it tells you so." },
    ],
  },
  {
    slug: "email-header-analyzer",
    name: "Email header analyzer",
    short: "Paste an email's headers to trace its route and check SPF, DKIM, DMARC and phishing signs.",
    seoTitle: "Email Header Analyzer: Trace Emails & Spot Phishing",
    description:
      "Paste raw email headers to see every server the email passed through, its SPF, DKIM and DMARC results, and spoofing signs like a mismatched Reply-To. Runs in your browser.",
    h1: "Email header analyzer",
    intro:
      "Paste the full headers of a suspicious email. You'll see the path it took, whether it passed SPF, DKIM and DMARC, and the tricks phishing emails use, like a fake display name or a different reply address.",
    privacy: "Headers are parsed in your browser with JavaScript. They are never uploaded, stored or sent to us.",
    cta: {
      title: "One convincing email is all it takes",
      body: "We test how far an attacker gets after the click: exposed services, weak authentication and access to data that should be off-limits.",
      service: "Not sure yet",
    },
    faqs: [
      { q: "How do I find an email's headers?", a: "In Gmail, open the email, click the three-dot menu and choose Show original. In Outlook, open the email and choose View, then View message details (in older desktop versions, File, then Properties). In Apple Mail, choose View, then Message, then All Headers." },
      { q: "How do I read Received headers?", a: "Each mail server adds a Received line at the top as the email passes through, so the bottom line is where the email started and the top one is your own mail server. This tool puts them in order and shows the delay at each hop." },
      { q: "What does DMARC fail mean?", a: "The domain in the visible From address didn't match a domain that passed SPF or DKIM. Legitimate email can fail when it's forwarded or misconfigured, but it's also exactly what spoofed email looks like." },
      { q: "Can email headers be faked?", a: "Anything added before the email reached a server you trust can be forged, including fake Received lines. The Authentication-Results header added by your own mail server is the part to rely on." },
    ],
  },
  {
    slug: "password-generator",
    name: "Password generator",
    short: "Create strong random passwords or memorable passphrases, generated securely in your browser.",
    seoTitle: "Strong Password Generator: Random Passwords & Passphrases",
    description:
      "Generate strong random passwords or easy-to-remember passphrases. Choose the length and characters, and see the entropy and crack time. Runs entirely in your browser.",
    h1: "Strong password generator",
    intro:
      "Create a random password or a passphrase made of real words. Choose the length and character types, and see how long it would take to crack. Nothing you generate leaves this page.",
    privacy:
      "Passwords are generated in your browser with the Web Crypto secure random source and never sent anywhere. Passphrases use the EFF large wordlist (7,776 words, CC BY 3.0).",
    cta: {
      title: "Strong passwords don't fix broken logins",
      body: "Our testers check the login, password reset and session handling in your real applications, the places where account takeovers actually happen.",
      service: "Web application pentest",
    },
    faqs: [
      { q: "Is it safe to use an online password generator?", a: "This one generates passwords in your browser with your device's secure random number generator. Nothing is sent to a server, so the password exists only on your screen until you save it." },
      { q: "How long should a password be?", a: "At least 16 random characters for important accounts, or a passphrase of 5 to 6 random words. Length adds far more strength than swapping letters for symbols." },
      { q: "Passphrase or random characters?", a: "Both are strong when they are long and random. Passphrases are easier to type and remember, so they suit the few passwords you must memorize, like your password manager's. Use random characters for everything stored in the manager." },
      { q: "What is password entropy?", a: "A measure of how unpredictable a password is, in bits. Each extra bit doubles the number of guesses an attacker needs. Around 80 bits or more is very strong against offline cracking." },
    ],
  },
];

// Display order on the hub, home page, footer and "More free tools".
const ORDER = [
  "penetration-testing-cost-calculator",
  "website-security-checker",
  "email-security-checker",
  "email-header-analyzer",
  "password-checker",
  "password-generator",
  "jwt-decoder",
  "cvss-calculator",
];

export const tools: ToolPage[] = ORDER.map((slug) => {
  const t = allTools.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool slug in ORDER: ${slug}`);
  return t;
});
if (tools.length !== allTools.length) throw new Error("Every tool must be listed in ORDER.");

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const toolPath = (t: { slug: string }) => `/tools/${t.slug}/`;
