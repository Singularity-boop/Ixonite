// Pentest effort model for the cost calculator. Tester-days per area, plus
// reporting. Tune the numbers here; the page and the PDF follow.

export type Choice = { v: string; label: string; days: number };
export type Area = {
  key: string;
  name: string;
  service: string; // matches an option in the booking form
  fields: { key: string; label: string; choices: Choice[] }[];
};

export const AREAS: Area[] = [
  {
    key: "web",
    name: "Web application",
    service: "Web application pentest",
    fields: [
      {
        key: "size",
        label: "Size",
        choices: [
          { v: "s", label: "Small: up to 20 pages", days: 3 },
          { v: "m", label: "Medium: 20–75 pages", days: 5 },
          { v: "l", label: "Large: 75+ pages", days: 8 },
        ],
      },
      {
        key: "roles",
        label: "User roles to test",
        choices: [
          { v: "1", label: "1 role", days: 0 },
          { v: "2", label: "2 roles (user + admin)", days: 1 },
          { v: "4", label: "3–4 roles", days: 2 },
          { v: "5", label: "5+ roles", days: 3 },
        ],
      },
    ],
  },
  {
    key: "api",
    name: "API",
    service: "Web application pentest",
    fields: [
      {
        key: "endpoints",
        label: "Endpoints",
        choices: [
          { v: "s", label: "Up to 25 endpoints", days: 2 },
          { v: "m", label: "25–100 endpoints", days: 4 },
          { v: "l", label: "100+ endpoints", days: 7 },
        ],
      },
    ],
  },
  {
    key: "mobile",
    name: "Mobile app",
    service: "Mobile / application pentest",
    fields: [
      {
        key: "platforms",
        label: "Platforms",
        choices: [
          { v: "one", label: "iOS or Android", days: 3 },
          { v: "both", label: "iOS and Android", days: 5 },
        ],
      },
    ],
  },
  {
    key: "external",
    name: "External network",
    service: "Network pentest",
    fields: [
      {
        key: "ips",
        label: "Internet-facing IPs",
        choices: [
          { v: "s", label: "1–10 IPs", days: 1 },
          { v: "m", label: "11–50 IPs", days: 2 },
          { v: "l", label: "51–250 IPs", days: 4 },
          { v: "xl", label: "250+ IPs", days: 6 },
        ],
      },
    ],
  },
  {
    key: "internal",
    name: "Internal network",
    service: "Network pentest",
    fields: [
      {
        key: "hosts",
        label: "Internal hosts",
        choices: [
          { v: "s", label: "Up to 250 hosts", days: 3 },
          { v: "m", label: "250–1,000 hosts", days: 5 },
          { v: "l", label: "1,000+ hosts", days: 8 },
        ],
      },
    ],
  },
];

export const COMPLIANCE = [
  { v: "none", label: "No specific standard", days: 0 },
  { v: "soc2", label: "SOC 2", days: 0 },
  { v: "iso", label: "ISO 27001", days: 0 },
  { v: "pci", label: "PCI DSS", days: 1 },
  { v: "hipaa", label: "HIPAA", days: 0 },
  { v: "customer", label: "Customer or investor request", days: 0 },
];

export type Scope = {
  areas: Record<string, { on: boolean; values: Record<string, string> }>;
  compliance: string;
};

export const DEFAULT_SCOPE: Scope = {
  areas: Object.fromEntries(
    AREAS.map((a) => [
      a.key,
      { on: a.key === "web", values: Object.fromEntries(a.fields.map((f) => [f.key, f.choices[Math.min(1, f.choices.length - 1)].v])) },
    ]),
  ),
  compliance: "none",
};

export type Line = { name: string; days: number; detail: string };

export function estimate(scope: Scope) {
  const lines: Line[] = [];
  for (const a of AREAS) {
    const st = scope.areas[a.key];
    if (!st?.on) continue;
    let days = 0;
    const parts: string[] = [];
    for (const f of a.fields) {
      const c = f.choices.find((x) => x.v === st.values[f.key]) ?? f.choices[0];
      days += c.days;
      parts.push(c.label);
    }
    lines.push({ name: a.name, days, detail: parts.join("; ") });
  }
  if (!lines.length) return null;

  const comp = COMPLIANCE.find((c) => c.v === scope.compliance) ?? COMPLIANCE[0];
  const hasNetwork = scope.areas.external?.on || scope.areas.internal?.on;
  if (comp.v === "pci" && hasNetwork) {
    lines.push({ name: "PCI DSS segmentation testing", days: comp.days, detail: "Proving the cardholder data environment is isolated" });
  }
  const testing = lines.reduce((n, l) => n + l.days, 0);
  const reporting = Math.max(1, Math.round(testing * 0.15));
  lines.push({ name: "Reporting and readout", days: reporting, detail: "Written report with evidence and fixes, plus a call with your engineers" });

  const total = testing + reporting;
  const low = Math.max(2, Math.round(total * 0.85));
  const high = Math.ceil(total * 1.2);
  const testers = high <= 10 ? 1 : high <= 25 ? 2 : 3;
  const weeks = (d: number) => Math.max(1, Math.ceil(d / (5 * testers)));

  const services = [...new Set(AREAS.filter((a) => scope.areas[a.key]?.on).map((a) => a.service))];
  return {
    lines,
    total,
    low,
    high,
    testers,
    weeksLow: weeks(low),
    weeksHigh: weeks(high),
    compliance: comp,
    service: services.length === 1 ? services[0] : "Not sure yet",
  };
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}
