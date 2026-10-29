// Site copy and placeholder data. Everything marked PLACEHOLDER needs the
// real material from Ixonite before launch.
import { services } from "./services-data";

export type { ServicePage as Service } from "./services-data";

export const SITE_URL = "https://ixonit.com";
export const SITE_NAME = "Ixonite";
export const CONTACT_EMAIL = "contact@ixonit.com"; // PLACEHOLDER address
export const SAMPLE_REPORT_URL = "/sample-pentest-report.pdf"; // PLACEHOLDER file

export const nav = [
  { href: "/#exhibits", label: "Services" },
  { href: "/#finding", label: "Sample finding" },
  { href: "/#method", label: "How it works" },
  { href: "/#handlers", label: "Team" },
  { href: "/#faq", label: "FAQ" },
];

export const leadService = services[0];
export const otherServices = services.slice(1);

export const custodyLog = [
  { when: "Day 0", handler: "Lead tester + you", action: "Scoping call. Agree targets, test accounts, dates and rules of engagement." },
  { when: "Day 1", handler: "Test team", action: "Map the application: every role, endpoint and integration." },
  { when: "Day 2–8", handler: "Test team", action: "Manual testing. Critical findings are reported to you the same day, not at the end." },
  { when: "Day 9", handler: "Lead tester", action: "Report delivered: every finding with evidence, impact and a specific fix." },
  { when: "Day 10", handler: "Lead tester + your engineers", action: "Readout call. Walk through findings and answer the hard questions." },
  { when: "After fixes", handler: "Test team", action: "Retest the fixed findings and issue an updated report for your auditors and customers." },
];

// PLACEHOLDER: names, roles, photos and LinkedIn URLs.
export const team = [
  { name: "Team member name", role: "Founder & lead penetration tester", photo: "/team/handler-1.svg", linkedin: "https://www.linkedin.com/" },
  { name: "Team member name", role: "Senior web application tester", photo: "/team/handler-2.svg", linkedin: "https://www.linkedin.com/" },
  { name: "Team member name", role: "Network & cloud tester", photo: "/team/handler-3.svg", linkedin: "https://www.linkedin.com/" },
  { name: "Team member name", role: "SOC lead", photo: "/team/handler-4.svg", linkedin: "https://www.linkedin.com/" },
];

export const serviceOptions = [...services.map((s) => s.formOption), "Not sure yet"];

// Home page FAQ. Also emitted as FAQPage structured data.
export const homeFaqs = [
  { q: "What is a penetration test?", a: "A penetration test (pentest) is an authorised, simulated attack on your systems by security testers. The goal is to find the weaknesses a real attacker would use, prove they are exploitable, and tell you how to fix them before someone else finds them." },
  { q: "How much does a penetration test cost?", a: "It depends on the size of what we test: number of user roles, API endpoints, IP ranges or apps. After a 30-minute scoping call you get a fixed quote, so the price does not change once testing starts." },
  { q: "How long does a penetration test take?", a: "A typical web application test runs one to two weeks, including the report. Network and mobile tests are often shorter. You get exact dates on the scoping call." },
  { q: "What is the difference between a vulnerability scan and a penetration test?", a: "A scan is automated and lists possible issues. A penetration test is done by people who confirm what is actually exploitable, chain issues together, and find logic and access-control flaws that scanners cannot see." },
  { q: "Will a penetration test help with SOC 2, ISO 27001 or PCI DSS?", a: "Yes. These frameworks expect regular independent security testing. Our report and retest letter are written so you can hand them to auditors and enterprise customers." },
  { q: "Do you retest after we fix the findings?", a: "Yes. Once your team has fixed the findings we retest them and issue an updated report showing what is resolved." },
];
