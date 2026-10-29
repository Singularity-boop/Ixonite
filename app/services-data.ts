// Service pages: one page per service so each can rank for its own search
// terms. PLACEHOLDER: provisional list until the owner sends the final one.

export type ServicePage = {
  tag: string;
  slug: string;
  id: string;
  name: string;
  // <title> and meta description: lead with the term buyers search for.
  seoTitle: string;
  description: string;
  summary: string;
  covers: string[];
  h1: string;
  intro: string[];
  whoFor: string[];
  scope: { title: string; body: string }[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  formOption: string;
};

export const services: ServicePage[] = [
  {
    tag: "A",
    slug: "web-application-penetration-testing",
    id: "web",
    name: "Web application penetration testing",
    seoTitle: "Web Application Penetration Testing Services",
    description:
      "Manual web application penetration testing for SaaS and online businesses. We test authentication, access control, business logic and APIs, and deliver a report with proof and fixes.",
    summary:
      "Our core work. Testers sign in as your real user roles and try to do what they should not: read another tenant's data, skip a payment step, escalate to admin. Scanners find the obvious. People find the logic flaws.",
    covers: [
      "Authentication, sessions and SSO",
      "Access control between users, roles and tenants",
      "Business logic and payment flows",
      "REST and GraphQL APIs",
      "Injection, XSS, SSRF and the rest of the OWASP Top 10",
      "Cloud storage and secrets exposed by the app",
    ],
    h1: "Web application penetration testing",
    intro: [
      "A web application penetration test is a controlled attack on your app by people who do this for a living. We sign in with the same roles your customers and staff use, then try to break the rules your app is supposed to enforce.",
      "Automated scanners are good at spotting missing headers and known library bugs. They cannot tell that a normal user just downloaded another company's invoices, or that a discount code can be applied twice. Those are the findings that turn into breaches, and they need a human tester.",
    ],
    whoFor: [
      "SaaS companies whose customers or auditors ask for a recent pentest report",
      "Teams preparing for SOC 2, ISO 27001 or PCI DSS",
      "Startups before a major launch or funding round",
      "Any business that handles customer data or payments through a web app",
    ],
    scope: [
      { title: "Authentication and sessions", body: "Login, password reset, MFA, SSO and session handling. We look for account takeover paths, weak tokens and sessions that never expire." },
      { title: "Access control", body: "Every role and every tenant boundary. Can a user read, change or delete data that belongs to someone else? Can a normal user reach admin functions?" },
      { title: "Business logic", body: "Checkout, billing, approvals, invitations and anything with rules. We try to skip steps, repeat steps and use features in ways the developers did not plan for." },
      { title: "APIs", body: "REST and GraphQL endpoints, including the ones your front end does not call. Mass assignment, excessive data exposure and missing rate limits are common here." },
      { title: "Injection and client-side attacks", body: "SQL and NoSQL injection, cross-site scripting, server-side request forgery, file upload abuse and the rest of the OWASP Top 10." },
      { title: "Cloud and secrets", body: "Storage buckets, keys in JavaScript bundles, exposed admin panels and metadata services reachable through the app." },
    ],
    deliverables: [
      "Executive summary written for non-technical readers",
      "Every finding with severity, evidence, impact and a specific fix",
      "Critical issues reported the same day we find them",
      "A readout call with your engineers",
      "A retest of fixed findings and an updated report you can share",
    ],
    faqs: [
      { q: "How long does a web application penetration test take?", a: "Most web apps take one to two weeks of testing, plus a day or two for the report. A small marketing site with a login can be faster; a large multi-tenant platform with many roles takes longer. We give you exact dates after the scoping call." },
      { q: "Do you test in production or staging?", a: "Either. Staging is safer and is our default when it matches production. If we test production we agree times, rate limits and off-limits actions with you first." },
      { q: "What do you need from us?", a: "A test environment, test accounts for each user role, any API documentation you have, and a contact we can reach if we find something critical." },
      { q: "Is this the same as a vulnerability scan?", a: "No. We use scanners for coverage, but most of the time goes into manual testing of logic and access control, which scanners cannot do." },
    ],
    formOption: "Web application pentest",
  },
  {
    tag: "B",
    slug: "network-penetration-testing",
    id: "network",
    name: "Network penetration testing",
    seoTitle: "Network Penetration Testing Services (Internal & External)",
    description:
      "External and internal network penetration testing. We find exposed services, weak configurations and Active Directory attack paths, and show exactly how an attacker would move through your network.",
    summary:
      "External and internal infrastructure: exposed services, weak configurations, lateral movement and the path from one foothold to your crown jewels.",
    covers: ["External perimeter", "Internal / assumed breach", "Active Directory", "Cloud network edges"],
    h1: "Network penetration testing",
    intro: [
      "A network penetration test shows what an attacker can reach from the internet, and what they can do once they are inside. We map your exposed services, try to get a foothold, then follow the path an attacker would take toward your most important systems.",
      "Instead of a long list of scanner output, you get the handful of attack paths that matter and the changes that close them.",
    ],
    whoFor: [
      "Companies with office networks, VPNs or on-premise servers",
      "Businesses running Active Directory or hybrid Azure AD",
      "Teams that need a network test for compliance or cyber insurance",
      "Anyone who has recently changed firewalls, VPNs or cloud networking",
    ],
    scope: [
      { title: "External perimeter", body: "Every internet-facing IP and hostname: VPNs, remote access, mail, exposed admin panels and forgotten services." },
      { title: "Internal and assumed breach", body: "We start from a normal employee laptop or a compromised account and see how far it gets." },
      { title: "Active Directory", body: "Kerberoasting, weak delegation, excessive permissions and paths to domain admin." },
      { title: "Segmentation", body: "Whether sensitive networks such as payment or production are actually separated from everything else." },
    ],
    deliverables: [
      "Attack path diagrams from first foothold to impact",
      "Every finding with evidence and a specific fix",
      "Prioritised remediation plan",
      "Readout call and retest of fixed findings",
    ],
    faqs: [
      { q: "What is the difference between internal and external network testing?", a: "External testing attacks what is visible from the internet. Internal testing assumes an attacker is already inside, for example through a phished laptop, and measures how far they can get." },
      { q: "Will testing disrupt our network?", a: "We avoid denial-of-service techniques and agree timing and limits with you before we start. Anything risky is confirmed with you first." },
      { q: "Can you test remotely?", a: "Yes. External tests are always remote, and internal tests usually run through a small VPN appliance or virtual machine you deploy." },
    ],
    formOption: "Network pentest",
  },
  {
    tag: "C",
    slug: "mobile-application-penetration-testing",
    id: "mobile",
    name: "Mobile & application penetration testing",
    seoTitle: "Mobile App Penetration Testing (iOS & Android)",
    description:
      "iOS and Android app penetration testing, including the APIs behind them, plus desktop and thick-client application testing. Findings come with proof and clear fixes.",
    summary:
      "iOS and Android apps, their local storage and the APIs behind them, plus desktop and thick-client applications.",
    covers: ["iOS and Android", "Backend APIs", "Local data storage", "Desktop / thick client"],
    h1: "Mobile and application penetration testing",
    intro: [
      "Mobile apps carry your users' sessions, personal data and often payment details on devices you do not control. We test the app on the device and, just as importantly, the APIs it talks to, where most serious mobile findings live.",
      "We also test desktop and thick-client applications that talk to your servers.",
    ],
    whoFor: [
      "Companies shipping iOS or Android apps to customers",
      "Fintech, health and marketplace apps handling sensitive data",
      "Teams whose app store or enterprise customers require a security test",
    ],
    scope: [
      { title: "Local data storage", body: "Tokens, personal data and secrets left in storage, logs, caches or backups." },
      { title: "Network traffic", body: "Certificate pinning, insecure connections and data sent that should not be." },
      { title: "Backend APIs", body: "Authentication, access control and business logic on the endpoints the app uses." },
      { title: "App hardening", body: "Reverse engineering, hard-coded keys, debug features and tampering protections." },
    ],
    deliverables: [
      "Separate findings for the app and its APIs",
      "Evidence and a specific fix for each finding",
      "Readout call with your mobile and backend engineers",
      "Retest of fixed findings",
    ],
    faqs: [
      { q: "Do you test both iOS and Android?", a: "Yes. If both apps share a backend we test the API once and the two clients separately, which keeps the cost down." },
      { q: "What do you need from us?", a: "Test builds (TestFlight or APK), test accounts for each role and any API documentation." },
    ],
    formOption: "Mobile / application pentest",
  },
  {
    tag: "D",
    slug: "soc-services",
    id: "soc",
    name: "SOC services",
    seoTitle: "SOC Services: Security Monitoring & Incident Response",
    description:
      "Managed SOC services: log monitoring, alert triage, detection tuning and incident response support, informed by how attackers actually break into systems like yours.",
    summary:
      "Monitoring and response after the test: we watch for the attacks we know work against you, and help your team act on alerts.",
    covers: ["Log monitoring", "Alert triage", "Incident response support", "Detection tuning"],
    h1: "SOC services: monitoring and response",
    intro: [
      "A penetration test shows how attackers get in. A security operations centre (SOC) watches for them doing it. Our SOC service monitors your logs and alerts, triages what matters and helps your team respond.",
      "Because the same people run our offensive testing, detections are tuned to the attack paths we actually see work, not just vendor defaults.",
    ],
    whoFor: [
      "Companies without a full-time security team",
      "Teams drowning in alerts from tools they already own",
      "Businesses that need monitoring for compliance or cyber insurance",
    ],
    scope: [
      { title: "Log monitoring", body: "Collecting and watching logs from your cloud, identity provider, endpoints and key applications." },
      { title: "Alert triage", body: "Separating real threats from noise and escalating only what needs your attention." },
      { title: "Detection tuning", body: "Writing and tuning detections for the techniques that work against your environment." },
      { title: "Incident response support", body: "Help to contain, investigate and recover when something does happen." },
    ],
    deliverables: [
      "Agreed escalation contacts and response times",
      "Regular reports on alerts, incidents and improvements",
      "Detections mapped to findings from your penetration tests",
    ],
    faqs: [
      { q: "Do we need to buy new tools?", a: "Usually not. We start with the logging and security tools you already have and recommend additions only where there is a real gap." },
      { q: "Can SOC services be combined with penetration testing?", a: "Yes, and it works best that way: each test produces new detections, and the SOC confirms whether the test activity would have been caught." },
    ],
    formOption: "SOC services",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const servicePath = (s: { slug: string }) => `/services/${s.slug}/`;
