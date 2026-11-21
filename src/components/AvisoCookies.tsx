"use client";

import { useEffect, useState } from "react";
import { OPEN_COOKIES_EVENT, readConsent, saveConsent } from "@/lib/consentimiento";

export default function AvisoCookies() {
  const [visible, setVisible] = useState(false);
  const [configurar, setConfigurar] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const previo = readConsent();
    if (previo) {
      setAnalytics(previo.analytics);
      setMarketing(previo.marketing);
    } else {
      setVisible(true);
    }
    const reabrir = () => {
      setConfigurar(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIES_EVENT, reabrir);
    return () => window.removeEventListener(OPEN_COOKIES_EVENT, reabrir);
  }, []);

  function guardar(a: boolean, m: boolean) {
    saveConsent(a, m);
    setAnalytics(a);
    setMarketing(m);
    setVisible(false);
    setConfigurar(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Preferencias de cookies">
      <div className="cookie-texto">
        <strong>Tu privacidad es importante</strong>
        <p>
          Usamos almacenamiento local para que el carrito y el modo oscuro funcionen. Con tu permiso también podemos
          medir el uso del sitio para mejorarlo. Tú decides.
        </p>
      </div>

      {configurar && (
        <div className="cookie-opciones">
          <label>
            <input type="checkbox" checked disabled /> Necesarias <small>(carrito y tema, siempre activas)</small>
          </label>
          <label>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analítica{" "}
            <small>(estadísticas anónimas de visitas)</small>
          </label>
          <label>
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing{" "}
            <small>(publicidad personalizada)</small>
          </label>
        </div>
      )}

      <div className="cookie-botones">
        <button type="button" className="cookie-btn cookie-btn-principal" onClick={() => guardar(true, true)}>
          Aceptar todas
        </button>
        <button type="button" className="cookie-btn" onClick={() => guardar(false, false)}>
          Solo necesarias
        </button>
        {configurar ? (
          <button type="button" className="cookie-btn" onClick={() => guardar(analytics, marketing)}>
            Guardar preferencias
          </button>
        ) : (
          <button type="button" className="cookie-btn cookie-btn-texto" onClick={() => setConfigurar(true)}>
            Configurar
          </button>
        )}
      </div>
    </div>
  );
}
