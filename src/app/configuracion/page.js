"use client";
import Link from "next/link";

export default function Configuracion() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <Link href="/perfil" className="text-sm text-gray-500 flex items-center gap-1 mb-4">← Volver</Link>
      <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Moneda principal</p>
            <p className="text-xs text-gray-500">Mostrar montos en</p>
          </div>
          <span className="text-sm font-medium text-emerald-700">USD ($)</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Tasa de referencia</p>
            <p className="text-xs text-gray-500">Para conversión Bs</p>
          </div>
          <span className="text-sm font-medium text-emerald-700">BCV</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Idioma</p>
            <p className="text-xs text-gray-500">Interfaz de la app</p>
          </div>
          <span className="text-sm font-medium text-emerald-700">Español</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Versión</p>
            <p className="text-xs text-gray-500">Rentto MVP</p>
          </div>
          <span className="text-sm font-medium text-gray-400">1.0.0</span>
        </div>
      </div>
    </div>
  );
}