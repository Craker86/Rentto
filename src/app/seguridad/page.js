"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Seguridad() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function cambiarPassword() {
    setCargando(true);
    setMensaje("");
    if (passwordNueva.length < 6) {
      setMensaje("La contraseña debe tener mínimo 6 caracteres");
      setCargando(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwordNueva });
    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Contraseña actualizada correctamente");
      setPasswordActual("");
      setPasswordNueva("");
    }
    setCargando(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <Link href="/perfil" className="text-sm text-gray-500 flex items-center gap-1 mb-4">← Volver</Link>
      <h1 className="text-xl font-bold text-gray-900">Seguridad</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Cambiar contraseña</h2>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Nueva contraseña</label>
          <input type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        {mensaje && <p className={`text-xs text-center ${mensaje.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>{mensaje}</p>}
        <button onClick={cambiarPassword} disabled={cargando} className={`w-full py-3 rounded-xl text-white font-semibold ${cargando ? "bg-gray-300" : "bg-emerald-700 hover:bg-emerald-800"}`}>
          {cargando ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </div>
    </div>
  );
}