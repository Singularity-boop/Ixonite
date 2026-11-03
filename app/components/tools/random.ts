// Shared by the password checker and generator.

// Unbiased random integer in [0, max) from the browser's secure source.
export function randomInt(max: number) {
  const a = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  do crypto.getRandomValues(a);
  while (a[0] >= limit);
  return a[0] % max;
}

// Strength label index from entropy bits, on the same scale for every tool.
export const strengthScore = (bits: number) => (bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4);
export const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

// Average time to crack offline: a fast hash at 10 billion guesses per second.
export const crackSeconds = (bits: number) => Math.pow(2, bits) / 2 / 1e10;

export function humanTime(seconds: number) {
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [31536000 * 100, "centuries"],
    [31536000, "years"],
    [2592000, "months"],
    [86400, "days"],
    [3600, "hours"],
    [60, "minutes"],
    [1, "seconds"],
  ];
  if (seconds > 31536000 * 1e6) return "millions of years";
  for (const [s, name] of units) {
    if (seconds >= s) return `${Math.round(seconds / s).toLocaleString()} ${name}`;
  }
  return "instantly";
}
