"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Inbox,
  DollarSign,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";

const ICONOS = {
  pago_recibido: { Icon: DollarSign, tone: "warning" },
  pago_confirmado: { Icon: CheckCircle2, tone: "success" },
  pago_rechazado: { Icon: XCircle, tone: "danger" },
  inquilino_vinculado: { Icon: Users, tone: "brand" },
};

export default function Notificaciones() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    const { data } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setItems(data || []);
    setCargando(false);
  }

  async function marcarTodasLeidas() {
    setMarcando(true);
    const ids = items.filter((n) => !n.leida).map((n) => n.id);
    if (ids.length === 0) { setMarcando(false); return; }
    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .in("id", ids);
    if (!error) {
      setItems(items.map((n) => ids.includes(n.id) ? { ...n, leida: true } : n));
    }
    setMarcando(false);
  }

  async function marcarUnaLeida(id) {
    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id", id);
    setItems(items.map((n) => n.id === id ? { ...n, leida: true } : n));
  }

  function abrirNotif(notif) {
    if (!notif.leida) marcarUnaLeida(notif.id);
    if (notif.link) router.push(notif.link);
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <p className="text-fg-subtle text-sm">Cargando…</p>
      </div>
    );
  }

  const noLeidas = items.filter((n) => !n.leida).length;

  return (
    <div className="min-h-screen bg-surface-muted pb-24">
      <div className="max-w-[480px] mx-auto px-5">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mt-5 mb-2 transition"
        >
          <ArrowLeft size={14} strokeWidth={2.25} /> Volver al perfil
        </Link>

        <header className="flex items-start justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-fg">Notificaciones</h1>
            <p className="text-sm text-fg-muted mt-1">
              {items.length === 0
                ? "Sin notificaciones por ahora"
                : `${items.length} ${items.length === 1 ? "notificación" : "notificaciones"}${noLeidas > 0 ? ` · ${noLeidas} sin leer` : ""}`}
            </p>
          </div>
          {noLeidas > 0 && (
            <button
              onClick={marcarTodasLeidas}
              disabled={marcando}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-pill hover:bg-brand-100 transition flex-shrink-0 disabled:opacity-60"
            >
              <CheckCheck size={12} strokeWidth={2.5} />
              {marcando ? "…" : "Marcar todas"}
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card p-10 text-center mt-6">
            <div className="w-14 h-14 bg-brand-50 rounded-pill flex items-center justify-center mx-auto">
              <Inbox size={24} className="text-brand-300" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-semibold text-fg mt-4">
              Tu inbox está vacío
            </p>
            <p className="text-xs text-fg-muted mt-1 max-w-[260px] mx-auto leading-relaxed">
              Te avisaremos cuando recibas o confirmes pagos, vinculaciones y eventos importantes.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-card shadow-card mt-4 divide-y divide-stroke overflow-hidden">
            {items.map((notif) => (
              <NotifRow key={notif.id} notif={notif} onClick={() => abrirNotif(notif)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifRow({ notif, onClick }) {
  const config = ICONOS[notif.tipo] || { Icon: Bell, tone: "neutral" };
  const { Icon, tone } = config;
  const iconStyles = {
    success: "bg-success-100 text-success-600",
    danger: "bg-danger-100 text-danger-600",
    warning: "bg-warning-100 text-warning-700",
    brand: "bg-brand-50 text-brand-700",
    neutral: "bg-surface-subtle text-fg-muted",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-4 hover:bg-surface-subtle transition ${
        !notif.leida ? "bg-brand-50/40" : ""
      }`}
    >
      <div className={`w-10 h-10 rounded-pill flex items-center justify-center flex-shrink-0 ${iconStyles}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${notif.leida ? "font-medium text-fg" : "font-bold text-fg"}`}>
            {notif.titulo}
          </p>
          {!notif.leida && (
            <span className="w-2 h-2 rounded-pill bg-brand-700 flex-shrink-0 mt-1.5" aria-label="No leída" />
          )}
        </div>
        {notif.cuerpo && (
          <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">{notif.cuerpo}</p>
        )}
        <p className="text-[10px] text-fg-subtle mt-1">
          {formatoFecha(notif.created_at)}
        </p>
      </div>
    </button>
  );
}

function formatoFecha(iso) {
  const fecha = new Date(iso);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDia = Math.floor(diffHr / 24);

  if (diffMin < 1) return "ahora mismo";
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
  if (diffHr < 24) return `hace ${diffHr} ${diffHr === 1 ? "hora" : "horas"}`;
  if (diffDia < 7) return `hace ${diffDia} ${diffDia === 1 ? "día" : "días"}`;
  return fecha.toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" });
}
