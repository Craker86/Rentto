"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Contrato() {
  const router = useRouter();
  const [propiedad, setPropiedad] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: prop } = await supabase
        .from("propiedades").select("*").limit(1).single();

      const { data: pagosData } = await supabase
        .from("pagos").select("*").eq("estado", "confirmado");

      setPropiedad(prop);
      setPagos(pagosData || []);
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  // Calcular el score basado en pagos confirmados
  // Cada pago confirmado suma 70 puntos, maximo 1000
  const pagosConfirmados = pagos.length;
  const score = Math.min(pagosConfirmados * 70 + 200, 1000);
  const scoreTexto = score >= 800 ? "Excelente" : score >= 600 ? "Bueno" : score >= 400 ? "Regular" : "En construcción";
  const scorePorcentaje = score / 10;

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">

      <h1 className="text-2xl font-bold text-gray-900">Mi alquiler</h1>

      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-medium mt-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        Contrato activo
      </div>

      {propiedad && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
          <p className="font-semibold text-gray-900">{propiedad.nombre}</p>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Dirección</span>
              <span className="text-xs font-medium text-gray-900">{propiedad.direccion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Propietario</span>
              <span className="text-xs font-medium text-gray-900">{propiedad.propietario_nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Monto mensual</span>
              <span className="text-xs font-bold text-emerald-700">${propiedad.monto_mensual} / mes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Día de corte</span>
              <span className="text-xs font-medium text-gray-900">{propiedad.dia_corte} de cada mes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Contrato hasta</span>
              <span className="text-xs font-medium text-gray-900">
                {propiedad.fecha_fin_contrato
                  ? new Date(propiedad.fecha_fin_contrato).toLocaleDateString("es-VE", { month: "long", year: "numeric" })
                  : "Sin fecha"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Cláusula de ajuste</span>
              <span className="text-xs font-medium text-gray-900">{propiedad.clausula_ajuste}</span>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-900 mt-6 mb-3">Reputación de pago</h2>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#059669" strokeWidth="3"
              strokeDasharray={`${scorePorcentaje} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-800">{score}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-emerald-800">{scoreTexto}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {pagosConfirmados} pagos confirmados
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            +70 pts por cada pago puntual
          </p>
        </div>
      </div>

      {score >= 600 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg">
            🏆
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Beneficio desbloqueado</p>
            <p className="text-xs text-gray-500">Tu puntaje te da acceso a tasas preferenciales en seguros de hogar</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg">
          📊
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {score >= 800 ? "Score máximo alcanzado" : "Tu score está subiendo"}
          </p>
          <p className="text-xs text-gray-500">
            {score >= 800
              ? "Mantén tus pagos puntuales para conservar tu nivel"
              : `Te faltan ${Math.ceil((800 - score) / 70)} pagos más para nivel Excelente`}
          </p>
        </div>
      </div>

    </div>
  );
}