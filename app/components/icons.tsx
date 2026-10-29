// One stroke family: 24px grid, 2px stroke, square caps.
type P = React.SVGProps<SVGSVGElement>;
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
};

export const ArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const Download = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v12M6 10l6 6 6-6M4 21h16" />
  </svg>
);

export const Check = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const Alert = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l10 18H2L12 3z" strokeLinejoin="miter" />
    <path d="M12 10v5M12 17.5v1" />
  </svg>
);

export const LinkedIn = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}>
    <rect width="24" height="24" fill="currentColor" />
    <path
      d="M6.5 9.5h2.6V18H6.5V9.5zm1.3-4.1a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10.8 9.5h2.5v1.2c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18h-2.6v-4.1c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.7V9.5z"
      fill="#fff"
    />
  </svg>
);

// Brand mark: a seal tab, punched once.
export const Mark = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden {...p}>
    <rect x="1" y="1" width="30" height="30" fill="#121316" />
    <path d="M1 22L22 1h9v2L3 31H1z" fill="#cf2a1f" />
    <circle cx="23" cy="23" r="3.5" fill="#ffc20e" />
  </svg>
);

// Seal marks for the custody log: state as a mark, not a hue.
export const SealClosed = (p: P) => (
  <svg viewBox="0 0 26 26" aria-hidden {...p}>
    <circle cx="13" cy="13" r="11" fill="none" stroke="#cf2a1f" strokeWidth="2.5" />
    <path d="M7.5 13.5l3.5 3.5 7.5-8" fill="none" stroke="#cf2a1f" strokeWidth="2.5" />
  </svg>
);
