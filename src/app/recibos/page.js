"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Recibos() {
  const router = useRouter();
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase.from("pagos").select("*").eq("estado", "confirmado").order("fecha_pago", { ascending: false });
      setPagos(data || []);
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <Link href="/perfil" className="text-sm text-gray-500 flex items-center gap-1 mb-4">← Volver</Link>
      <h1 className="text-xl font-bold text-gray-900">Recibos y facturas</h1>
      <p className="text-xs text-gray-500 mt-1">{pagos.length} pagos confirmados</p>
      <div className="flex flex-col gap-2 mt-4">
        {pagos.map((pago) => (
          <div key={pago.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-900">${pago.monto} · {pago.metodo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(pago.fecha_pago).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">Pagado</span>
            </div>
            {pago.referencia && <p className="text-xs text-gray-400 mt-2">Ref: {pago.referencia}</p>}
            {pago.comprobante_url && <a href={pago.comprobante_url} target="_blank" className="text-xs text-emerald-700 font-medium mt-2 block">📎 Ver comprobante</a>}
          </div>
        ))}
        {pagos.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No tienes recibos todavía</p>}
      </div>
    </div>
  );
}