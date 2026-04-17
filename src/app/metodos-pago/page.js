"use client";
import Link from "next/link";

export default function MetodosPago() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <Link href="/perfil" className="text-sm text-gray-500 flex items-center gap-1 mb-4">← Volver</Link>
      <h1 className="text-xl font-bold text-gray-900">Métodos de pago</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 space-y-3">
        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
          <span className="text-xl">📱</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Pago móvil</p>
            <p className="text-xs text-gray-500">Disponible en todos los bancos</p>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">Activo</span>
        </div>
        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
          <span className="text-xl font-bold text-purple-700">Z</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Zelle</p>
            <p className="text-xs text-gray-500">Pagos en USD</p>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">Activo</span>
        </div>
        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
          <span className="text-xl">🏦</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Transferencia bancaria</p>
            <p className="text-xs text-gray-500">Cualquier banco nacional</p>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">Activo</span>
        </div>
        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
          <span className="text-xl">💳</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Binance Pay</p>
            <p className="text-xs text-gray-500">USDT y criptomonedas</p>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">Activo</span>
        </div>
      </div>
    </div>
  );
}