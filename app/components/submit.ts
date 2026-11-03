// Posts a form to the mailer route in app/api/contact.
export async function sendForm(data: Record<string, string>): Promise<boolean> {
  try {
    const body = new FormData();
    for (const [k, v] of Object.entries(data)) body.append(k, v);
    const res = await fetch("/api/contact/", { method: "POST", body });
    if (!res.ok) return false;
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return Boolean(json?.ok);
  } catch {
    return false;
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PREFILL_EVENT = "ixn:prefill";
export type PrefillDetail = { email?: string; service?: string; message?: string };
