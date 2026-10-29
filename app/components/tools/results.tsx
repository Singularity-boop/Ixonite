// Shared result model for every tool: a list of checks, each with a status
// shown as a mark (state is a mark, not a hue), plus the fix when it failed.

export type Status = "pass" | "warn" | "fail" | "info";

export type Check = {
  label: string;
  status: Status;
  detail: string;
  fix?: string;
  value?: string;
};

export type ToolResult = {
  tool: string;
  target: string;
  grade?: string;
  summary: string;
  checks: Check[];
};

const statusText: Record<Status, string> = {
  pass: "Pass",
  warn: "Warning",
  fail: "Fail",
  info: "Info",
};

function StatusMark({ status }: { status: Status }) {
  return (
    <span className={`mark mark-${status}`} aria-label={statusText[status]} role="img">
      <svg viewBox="0 0 24 24" aria-hidden>
        {status === "pass" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
        {status === "fail" && <path d="M6 6l12 12M18 6L6 18" />}
        {status === "warn" && <path d="M12 6v8M12 17.5v1" />}
        {status === "info" && <path d="M12 10v8M12 6v1" />}
      </svg>
    </span>
  );
}

export function ResultList({ result }: { result: ToolResult }) {
  const counts = result.checks.reduce(
    (acc, c) => ((acc[c.status] += 1), acc),
    { pass: 0, warn: 0, fail: 0, info: 0 } as Record<Status, number>,
  );
  return (
    <div className="results" aria-live="polite">
      <div className="results-head">
        {result.grade && (
          <span className={`grade grade-${result.grade[0].toLowerCase()}`} data-stamp>
            <small>Grade</small>
            <strong>{result.grade}</strong>
          </span>
        )}
        <div>
          <p className="results-target typed">{result.target}</p>
          <p className="results-summary">{result.summary}</p>
          <p className="results-counts typed tnum">
            {counts.pass} pass · {counts.warn} warning · {counts.fail} fail
          </p>
        </div>
      </div>
      <ul className="checks">
        {result.checks.map((c, i) => (
          <li key={i} className={`check check-${c.status}`}>
            <StatusMark status={c.status} />
            <div>
              <h3>{c.label}</h3>
              <p>{c.detail}</p>
              {c.value && <pre className="check-value">{c.value}</pre>}
              {c.fix && (
                <p className="check-fix">
                  <b>Fix:</b> {c.fix}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
