"use client";

import { OPEN_COOKIES_EVENT } from "@/lib/consentimiento";

export default function BotonCookies() {
  return (
    <button type="button" className="cookie-link" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIES_EVENT))}>
      Preferencias de cookies
    </button>
  );
}
