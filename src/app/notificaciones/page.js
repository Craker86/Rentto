"use client";
import Link from "next/link";

export default function Notificaciones() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <Link href="/perfil" className="text-sm text-gray-500 flex items-center gap-1 mb-4">← Volver</Link>
      <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Recordatorio de pago</p>
            <p className="text-xs text-gray-500">3 días antes del vencimiento</p>
          </div>
          <div className="w-10 h-6 bg-emerald-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Pago confirmado</p>
            <p className="text-xs text-gray-500">Cuando el propietario confirma</p>
          </div>
          <div className="w-10 h-6 bg-emerald-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Cambio de tasa BCV</p>
            <p className="text-xs text-gray-500">Cuando la tasa cambia más del 5%</p>
          </div>
          <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Promociones</p>
            <p className="text-xs text-gray-500">Ofertas y beneficios</p>
          </div>
          <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
        </div>
      </div>
    </div>
  );
}