// Builds a one-file PDF of a tool's results. Loaded only when someone asks
// for the PDF, so jsPDF stays out of the main bundle.
import { jsPDF } from "jspdf";
import type { ToolResult } from "./results";

const INK: [number, number, number] = [18, 19, 22];
const MUTED: [number, number, number] = [68, 74, 84];
const SEAL: [number, number, number] = [207, 42, 31];
const MARKER: [number, number, number] = [255, 194, 14];
const statusColor = { pass: [37, 120, 64], warn: [176, 120, 0], fail: SEAL, info: MUTED } as const;
const statusLabel = { pass: "PASS", warn: "WARNING", fail: "FAIL", info: "INFO" } as const;

export async function downloadReport(r: ToolResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const header = () => {
    doc.setFillColor(...INK).rect(0, 0, W, 64, "F");
    doc.setFillColor(...SEAL).rect(0, 64, W, 8, "F");
    doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(20).text("IXONITE", M, 40);
    doc.setFont("helvetica", "normal").setFontSize(10).text(r.tool, W - M, 40, { align: "right" });
    y = 104;
  };
  const ensure = (h: number) => {
    if (y + h > H - 60) {
      doc.addPage();
      header();
    }
  };
  const para = (text: string, size: number, color: [number, number, number], bold = false, indent = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size).setTextColor(...color);
    const lines = doc.splitTextToSize(text, W - M * 2 - indent) as string[];
    ensure(lines.length * size * 1.35);
    doc.text(lines, M + indent, y);
    y += lines.length * size * 1.35;
  };

  header();
  para("Security check results", 22, INK, true);
  y += 4;
  para(`Target: ${r.target}`, 11, MUTED);
  para(`Checked: ${new Date().toUTCString()}`, 11, MUTED);
  y += 10;
  if (r.grade) {
    doc.setFillColor(...MARKER).rect(M, y - 4, 90, 40, "F");
    doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(24).text(r.grade, M + 45, y + 26, { align: "center" });
    doc.setFontSize(9).setFont("helvetica", "normal").text("GRADE", M + 100, y + 10);
    y += 50;
  }
  para(r.summary, 12, INK);
  y += 12;

  for (const c of r.checks) {
    ensure(60);
    doc.setDrawColor(169, 182, 196).line(M, y - 6, W - M, y - 6);
    y += 10;
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...(statusColor[c.status] as [number, number, number]));
    doc.text(statusLabel[c.status], M, y);
    doc.setTextColor(...INK).setFontSize(12).text(c.label, M + 70, y);
    y += 16;
    para(c.detail, 10, MUTED, false, 70);
    if (c.value) para(c.value, 9, INK, false, 70);
    if (c.fix) para(`Fix: ${c.fix}`, 10, INK, false, 70);
    y += 10;
  }

  ensure(110);
  y += 10;
  doc.setFillColor(242, 243, 239).rect(M, y, W - M * 2, 90, "F");
  doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(14).text("Want the full picture?", M + 16, y + 28);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      "Automated checks only see the surface. Ixonite's testers find the access control, logic and authentication flaws that lead to real breaches. Book a scoping call at ixonit.com.",
      W - M * 2 - 32,
    ),
    M + 16,
    y + 48,
  );

  const safe = r.target.replace(/[^a-z0-9.-]+/gi, "-").slice(0, 40) || "results";
  doc.save(`ixonite-${r.tool.toLowerCase().replace(/[^a-z]+/g, "-")}-${safe}.pdf`);
}
