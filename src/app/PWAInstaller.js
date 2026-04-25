"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Registrar el service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Detecta si ya está corriendo como app instalada (standalone)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    // Captura el prompt nativo de instalación
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Solo mostrar el banner si el usuario no lo descartó antes
      if (localStorage.getItem("pwa-install-dismissed") !== "true") {
        setShowBanner(true);
      }
    };

    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function instalar() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }

  function descartar() {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  }

  if (installed || !showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 max-w-[480px] mx-auto px-5 pointer-events-none">
      <div className="bg-brand-800 text-fg-inverse rounded-card p-3 shadow-pop flex items-center gap-3 pointer-events-auto">
        <div className="w-9 h-9 bg-white/15 rounded-pill flex items-center justify-center flex-shrink-0">
          <Download size={16} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold">Instala Rentto en tu teléfono</p>
          <p className="text-[11px] opacity-85">Acceso rápido sin abrir el navegador</p>
        </div>
        <button
          onClick={instalar}
          className="text-xs font-bold bg-white text-brand-800 px-3 py-1.5 rounded-pill flex-shrink-0 hover:brightness-95 transition"
        >
          Instalar
        </button>
        <button
          onClick={descartar}
          aria-label="Cerrar"
          className="w-7 h-7 rounded-pill text-fg-inverse hover:bg-white/10 flex items-center justify-center flex-shrink-0 transition"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
