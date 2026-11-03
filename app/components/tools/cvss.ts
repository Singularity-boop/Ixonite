// CVSS v3.1 base and temporal scores, per the FIRST specification:
// https://www.first.org/cvss/v3.1/specification-document

export type Metric = {
  key: string;
  name: string;
  values: { v: string; label: string; help: string }[];
};

export const BASE_METRICS: Metric[] = [
  {
    key: "AV",
    name: "Attack vector",
    values: [
      { v: "N", label: "Network", help: "Exploitable remotely, for example over the internet." },
      { v: "A", label: "Adjacent", help: "The attacker must be on the same local network, Wi-Fi or Bluetooth range." },
      { v: "L", label: "Local", help: "The attacker needs local access, or a user must open a malicious file." },
      { v: "P", label: "Physical", help: "The attacker must physically touch the device." },
    ],
  },
  {
    key: "AC",
    name: "Attack complexity",
    values: [
      { v: "L", label: "Low", help: "No special conditions. The attack works whenever it is tried." },
      { v: "H", label: "High", help: "Success depends on conditions outside the attacker's control, such as winning a race condition or a man-in-the-middle position." },
    ],
  },
  {
    key: "PR",
    name: "Privileges required",
    values: [
      { v: "N", label: "None", help: "No login needed." },
      { v: "L", label: "Low", help: "A normal user account is enough." },
      { v: "H", label: "High", help: "An administrator or other privileged account is needed." },
    ],
  },
  {
    key: "UI",
    name: "User interaction",
    values: [
      { v: "N", label: "None", help: "No action from any other user is needed." },
      { v: "R", label: "Required", help: "Another user must do something, such as click a link or open a page." },
    ],
  },
  {
    key: "S",
    name: "Scope",
    values: [
      { v: "U", label: "Unchanged", help: "The impact stays inside the vulnerable component." },
      { v: "C", label: "Changed", help: "The impact reaches other components, such as XSS running in users' browsers or escaping a container." },
    ],
  },
  {
    key: "C",
    name: "Confidentiality",
    values: [
      { v: "N", label: "None", help: "No data is exposed." },
      { v: "L", label: "Low", help: "Some data is exposed, but the attacker can't choose what or how much." },
      { v: "H", label: "High", help: "The attacker can read all data, or critical data such as passwords or keys." },
    ],
  },
  {
    key: "I",
    name: "Integrity",
    values: [
      { v: "N", label: "None", help: "No data can be changed." },
      { v: "L", label: "Low", help: "Some data can be changed, with limited control over what." },
      { v: "H", label: "High", help: "The attacker can change any data, or data that matters most." },
    ],
  },
  {
    key: "A",
    name: "Availability",
    values: [
      { v: "N", label: "None", help: "No effect on availability." },
      { v: "L", label: "Low", help: "Performance drops or the service is interrupted at times." },
      { v: "H", label: "High", help: "The attacker can take the service down completely, or keep it down." },
    ],
  },
];

export const TEMPORAL_METRICS: Metric[] = [
  {
    key: "E",
    name: "Exploit code maturity",
    values: [
      { v: "X", label: "Not defined", help: "Leave out of the score." },
      { v: "U", label: "Unproven", help: "No exploit code is available, or the exploit is theoretical." },
      { v: "P", label: "Proof of concept", help: "Proof-of-concept code exists but needs work to be practical." },
      { v: "F", label: "Functional", help: "Working exploit code exists for most systems." },
      { v: "H", label: "High", help: "Reliable, automated exploits exist, or exploitation is trivial." },
    ],
  },
  {
    key: "RL",
    name: "Remediation level",
    values: [
      { v: "X", label: "Not defined", help: "Leave out of the score." },
      { v: "O", label: "Official fix", help: "The vendor has released a complete fix." },
      { v: "T", label: "Temporary fix", help: "An official but temporary fix or hotfix exists." },
      { v: "W", label: "Workaround", help: "Only an unofficial workaround exists." },
      { v: "U", label: "Unavailable", help: "There is no fix or workaround." },
    ],
  },
  {
    key: "RC",
    name: "Report confidence",
    values: [
      { v: "X", label: "Not defined", help: "Leave out of the score." },
      { v: "U", label: "Unknown", help: "Reports conflict and the cause is uncertain." },
      { v: "R", label: "Reasonable", help: "Significant details are published, but the root cause isn't fully confirmed." },
      { v: "C", label: "Confirmed", help: "Confirmed by the vendor, or reproduced with working code." },
    ],
  },
];

const W: Record<string, Record<string, number>> = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  UI: { N: 0.85, R: 0.62 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
  E: { X: 1, U: 0.91, P: 0.94, F: 0.97, H: 1 },
  RL: { X: 1, O: 0.95, T: 0.96, W: 0.97, U: 1 },
  RC: { X: 1, U: 0.92, R: 0.96, C: 1 },
};

export type Vector = Record<string, string>;

// Round up to one decimal, as defined in CVSS v3.1 Appendix A, avoiding
// floating point errors.
export function roundup(x: number) {
  const i = Math.round(x * 100000);
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10;
}

export function severity(score: number) {
  if (score === 0) return "None";
  if (score < 4) return "Low";
  if (score < 7) return "Medium";
  if (score < 9) return "High";
  return "Critical";
}

export const isComplete = (v: Vector) => BASE_METRICS.every((m) => v[m.key]);

export function score(v: Vector) {
  if (!isComplete(v)) return null;
  const changed = v.S === "C";
  const pr = { N: 0.85, L: changed ? 0.68 : 0.62, H: changed ? 0.5 : 0.27 }[v.PR as "N" | "L" | "H"];
  const iss = 1 - (1 - W.CIA[v.C]) * (1 - W.CIA[v.I]) * (1 - W.CIA[v.A]);
  const impact = changed ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const exploitability = 8.22 * W.AV[v.AV] * W.AC[v.AC] * pr * W.UI[v.UI];
  const base = impact <= 0 ? 0 : roundup(Math.min((changed ? 1.08 : 1) * (impact + exploitability), 10));
  const hasTemporal = TEMPORAL_METRICS.some((m) => v[m.key] && v[m.key] !== "X");
  const temporal = roundup(base * W.E[v.E ?? "X"] * W.RL[v.RL ?? "X"] * W.RC[v.RC ?? "X"]);
  return {
    base,
    impact: Math.max(0, Math.round(impact * 10) / 10),
    exploitability: Math.round(exploitability * 10) / 10,
    temporal: hasTemporal ? temporal : null,
  };
}

export function toVectorString(v: Vector) {
  const parts = BASE_METRICS.map((m) => `${m.key}:${v[m.key]}`);
  for (const m of TEMPORAL_METRICS) if (v[m.key] && v[m.key] !== "X") parts.push(`${m.key}:${v[m.key]}`);
  return `CVSS:3.1/${parts.join("/")}`;
}

// Accepts "CVSS:3.1/AV:N/..." (or 3.0, or no prefix). Returns the parsed
// metrics, or an error message for the visitor.
export function parseVector(input: string): { ok: true; vector: Vector } | { ok: false; error: string } {
  const s = input.trim().replace(/^#/, "");
  if (/^CVSS:4\.0\//i.test(s)) return { ok: false, error: "That's a CVSS 4.0 vector. This calculator scores CVSS 3.1." };
  const body = s.replace(/^CVSS:3\.[01]\//i, "");
  const all = [...BASE_METRICS, ...TEMPORAL_METRICS];
  const vector: Vector = {};
  for (const part of body.split("/").filter(Boolean)) {
    const [k, val] = part.split(":").map((x) => x.trim().toUpperCase());
    const m = all.find((x) => x.key === k);
    if (!m || !m.values.some((x) => x.v === val)) return { ok: false, error: `"${part}" isn't a valid CVSS 3.1 metric.` };
    vector[k] = val;
  }
  if (!isComplete(vector)) {
    const missing = BASE_METRICS.filter((m) => !vector[m.key]).map((m) => m.key);
    return { ok: false, error: `The vector is missing ${missing.join(", ")}.` };
  }
  return { ok: true, vector };
}
