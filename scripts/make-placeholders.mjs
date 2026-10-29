// Generates placeholder assets: the sample report PDF and team portraits.
// Run with `node scripts/make-placeholders.mjs`. Replace the outputs with
// the real report and photos before launch.
import { writeFileSync, mkdirSync } from "node:fs";

// ---------- Sample report PDF (two pages, Helvetica / Courier) ----------
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const text = (x, y, size, str, font = "F1") => `BT /${font} ${size} Tf ${x} ${y} Td (${esc(str)}) Tj ET`;
const rect = (x, y, w, h, rgb) => `${rgb} rg ${x} ${y} ${w} ${h} re f`;

const page1 = [
  rect(0, 0, 595, 842, "0.949 0.953 0.937"),
  rect(0, 742, 595, 100, "0.071 0.075 0.086"),
  "1 1 1 rg",
  text(48, 790, 30, "IXONITE", "F2"),
  text(48, 762, 11, "Penetration Test Report  |  SAMPLE / PLACEHOLDER"),
  rect(0, 728, 595, 14, "0.812 0.165 0.122"),
  "0.071 0.075 0.086 rg",
  text(48, 680, 22, "Web Application Penetration Test", "F2"),
  text(48, 656, 12, "Client: Example Client Ltd (synthetic)   Dates: 2026-10-05 to 2026-10-14"),
  text(48, 600, 14, "Executive summary", "F2"),
  text(48, 578, 11, "Ixonite tested the client's customer portal and REST API over eight days."),
  text(48, 562, 11, "Testers found 10 issues: 1 critical, 2 high, 4 medium and 3 low."),
  text(48, 546, 11, "The critical issue let any signed-in user read other customers' invoices."),
  text(48, 530, 11, "All critical and high findings were fixed and verified in a retest."),
  text(48, 480, 14, "Findings overview", "F2"),
  rect(48, 430, 110, 34, "0.812 0.165 0.122"),
  "1 1 1 rg",
  text(58, 442, 12, "1 CRITICAL", "F2"),
  "0.071 0.075 0.086 rg",
  text(178, 442, 12, "2 HIGH", "F2"),
  text(288, 442, 12, "4 MEDIUM", "F2"),
  text(398, 442, 12, "3 LOW", "F2"),
  text(48, 380, 10, "A-03  Broken access control on /api/v2/invoices/{id}    CRITICAL   Fixed", "F3"),
  text(48, 362, 10, "A-01  Password reset token valid for 30 days           HIGH       Fixed", "F3"),
  text(48, 344, 10, "A-07  Stored XSS in invoice notes field                HIGH       Fixed", "F3"),
  text(48, 326, 10, "A-02  No rate limit on login                           MEDIUM     Open", "F3"),
  text(48, 120, 9, "This is a placeholder document. Replace public/sample-pentest-report.pdf with the real sample report."),
  text(48, 106, 9, "All names, data and findings in this file are synthetic. contact@ixonit.com  |  ixonit.com"),
].join("\n");

const page2 = [
  rect(0, 0, 595, 842, "0.949 0.953 0.937"),
  "0.071 0.075 0.086 rg",
  text(48, 780, 18, "Finding A-03: Any user can read any customer's invoices", "F2"),
  rect(48, 744, 80, 22, "0.812 0.165 0.122"),
  "1 1 1 rg",
  text(56, 751, 11, "CRITICAL", "F2"),
  "0.071 0.075 0.086 rg",
  text(140, 751, 11, "CVSS 3.1: 8.6   CWE-639 Authorization bypass through user-controlled key"),
  text(48, 710, 12, "Evidence", "F2"),
  rect(48, 610, 499, 90, "0.071 0.075 0.086"),
  "0.9 0.9 0.89 rg",
  text(60, 682, 9, "GET /api/v2/invoices/48213 HTTP/1.1", "F3"),
  text(60, 668, 9, "Authorization: Bearer eyJhbGciOi...  (tenant 1102)", "F3"),
  text(60, 646, 9, "HTTP/1.1 200 OK", "F3"),
  text(60, 632, 9, '{ "invoice_id": 48213, "tenant_id": 2271, "total": "14,920.00" }', "F3"),
  "0.071 0.075 0.086 rg",
  text(48, 576, 12, "Impact", "F2"),
  text(48, 558, 11, "A free trial account can download every customer's invoices, including bank details."),
  text(48, 520, 12, "Fix", "F2"),
  text(48, 502, 11, "Query invoices by invoice_id AND the session's tenant_id; return 404 on mismatch."),
  text(48, 486, 11, "Add an automated test that requests another tenant's invoice."),
  text(48, 448, 12, "Retest", "F2"),
  text(48, 430, 11, "2026-10-28: fix verified. Request now returns 404 for other tenants' invoices."),
  text(48, 106, 9, "Placeholder sample. Synthetic data only."),
].join("\n");

const objs = [];
objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
objs[2] = "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>";
const res = "/Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >>";
objs[3] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ${res} /Contents 8 0 R >>`;
objs[4] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ${res} /Contents 9 0 R >>`;
objs[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
objs[6] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
objs[7] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";
objs[8] = `<< /Length ${Buffer.byteLength(page1)} >>\nstream\n${page1}\nendstream`;
objs[9] = `<< /Length ${Buffer.byteLength(page2)} >>\nstream\n${page2}\nendstream`;

let pdf = "%PDF-1.4\n";
const offsets = [];
for (let i = 1; i < objs.length; i++) {
  offsets[i] = Buffer.byteLength(pdf);
  pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
}
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
for (let i = 1; i < objs.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
writeFileSync("public/sample-pentest-report.pdf", pdf, "latin1");

// ---------- Team portrait placeholders ----------
mkdirSync("public/team", { recursive: true });
const tones = ["#c9cfc6", "#bfc8d2", "#d2cabf", "#c6c2cf"];
tones.forEach((bg, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <!-- PLACEHOLDER portrait: replace with a real photo (square, 800x800 or larger) -->
  <rect width="400" height="400" fill="${bg}"/>
  <circle cx="200" cy="160" r="72" fill="#121316" opacity="0.82"/>
  <path d="M60 400c10-90 70-140 140-140s130 50 140 140z" fill="#121316" opacity="0.82"/>
  <text x="20" y="34" font-family="Courier New, monospace" font-size="18" font-weight="700" fill="#121316">PHOTO PENDING</text>
</svg>`;
  writeFileSync(`public/team/handler-${i + 1}.svg`, svg);
});

console.log("placeholders written");
