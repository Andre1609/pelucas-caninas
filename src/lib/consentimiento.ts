export type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const CONSENT_KEY = "pc-cookies-v1";
export const OPEN_COOKIES_EVENT = "pc:open-cookies";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, marketing: boolean): Consent {
  const consent: Consent = { necessary: true, analytics, marketing, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {}
  return consent;
}
