"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Propietario() {
  const router = useRouter();
  const [pagos, setPagos] = useState([]);
  const [propiedad, setPropiedad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({ confirmados: 0, pendientes: 0, total: 0 });
  const [propiedades, setPropiedades] = useState([]);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [editando, setEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editMonto, setEditMonto] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editRequisitos, setEditRequisitos] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", session.user.id).single();
      if (!perfil || perfil.rol !== "propietario") { router.push("/dashboard"); return; }
    
      const { data: prop } = await supabase
        .from("propiedades").select("*").limit(1).single();

      const { data: pagosData } = await supabase
        .from("pagos").select("*").order("fecha_pago", { ascending: false });

      setPropiedad(prop);
      setPagos(pagosData || []);

      const confirmados = (pagosData || []).filter(p => p.estado === "confirmado").length;
      const pendientes = (pagosData || []).filter(p => p.estado === "pendiente").length;
      const total = (pagosData || []).reduce((sum, p) => sum + Number(p.monto), 0);
      setStats({ confirmados, pendientes, total });

      const { data: propsData } = await supabase
        .from("propiedades")
        .select("*, vinculaciones(*)")
        .order("created_at", { ascending: false });
      setPropiedades(propsData || []);

      setCargando(false);
    }
    cargar();
  }, []);

  async function confirmarPago(pagoId) {
    const { error } = await supabase.from("pagos").update({ estado: "confirmado" }).eq("id", pagoId);
    if (!error) {
      setPagos(pagos.map(p => p.id === pagoId ? { ...p, estado: "confirmado" } : p));
      setStats(prev => ({ ...prev, confirmados: prev.confirmados + 1, pendientes: prev.pendientes - 1 }));
    }
  }

  async function rechazarPago(pagoId) {
    const { error } = await supabase.from("pagos").update({ estado: "rechazado" }).eq("id", pagoId);
    if (!error) {
      setPagos(pagos.map(p => p.id === pagoId ? { ...p, estado: "rechazado" } : p));
      setStats(prev => ({ ...prev, pendientes: prev.pendientes - 1 }));
    }
  }

  function iniciarEdicion(prop) {
    setEditando(prop.id);
    setEditNombre(prop.nombre);
    setEditDireccion(prop.direccion);
    setEditMonto(prop.monto_mensual);
    setEditDescripcion(prop.descripcion || "");
    setEditRequisitos(prop.requisitos || "");
  }

  async function guardarEdicion() {
    setGuardando(true);
    const { error } = await supabase.from("propiedades").update({
      nombre: editNombre,
      direccion: editDireccion,
      monto_mensual: Number(editMonto),
      descripcion: editDescripcion,
      requisitos: editRequisitos,
    }).eq("id", editando);

    if (!error) {
      setPropiedades(propiedades.map(p => p.id === editando ? {
        ...p, nombre: editNombre, direccion: editDireccion, monto_mensual: Number(editMonto), descripcion: editDescripcion, requisitos: editRequisitos
      } : p));
      setEditando(null);
    }
    setGuardando(false);
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">

      <h1 className="text-2xl font-bold text-gray-900">Panel del propietario</h1>
      <p className="text-sm text-gray-500 mt-1">{propiedad?.nombre}</p>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.confirmados}</p>
          <p className="text-[10px] text-gray-500 mt-1">Confirmados</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.pendientes}</p>
          <p className="text-[10px] text-gray-500 mt-1">Pendientes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">${stats.total}</p>
          <p className="text-[10px] text-gray-500 mt-1">Total cobrado</p>
        </div>
      </div>

      <Link href="/nueva-propiedad" className="block w-full py-3 bg-emerald-700 text-white text-center rounded-xl font-semibold text-sm mt-4 hover:bg-emerald-800 transition-colors">
        + Agregar propiedad
      </Link>

      {propiedades.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Mis propiedades</h2>
          <div className="flex flex-col gap-3">
            {propiedades.map((prop) => (
              <div key={prop.id} className="bg-white border border-gray-200 rounded-xl p-4">

                {editando === prop.id ? (
                  <div className="space-y-3">
                    <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    <input type="text" value={editDireccion} onChange={(e) => setEditDireccion(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    <input type="number" value={editMonto} onChange={(e) => setEditMonto(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    <textarea value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} placeholder="Descripción" rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none" />
                    <textarea value={editRequisitos} onChange={(e) => setEditRequisitos(e.target.value)} placeholder="Requisitos" rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={guardarEdicion} disabled={guardando} className="flex-1 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                        {guardando ? "Guardando..." : "Guardar"}
                      </button>
                      <button onClick={() => setEditando(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{prop.nombre}</p>
                        <p className="text-xs text-gray-500 mt-1">{prop.direccion}</p>
                      </div>
                      <button onClick={() => iniciarEdicion(prop)} className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-md">
                        Editar
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-emerald-700">${prop.monto_mensual}/mes</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-medium">Corte día {prop.dia_corte}</span>
                    </div>

                    {prop.descripcion && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{prop.descripcion}</p>
                    )}

                    {prop.requisitos && (
                      <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                        <p className="text-[10px] font-semibold text-amber-800">Requisitos:</p>
                        <p className="text-xs text-amber-700 mt-0.5">{prop.requisitos}</p>
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500">Código para tu inquilino:</p>
                      <p className="text-lg font-bold text-emerald-700 tracking-widest mt-1">{prop.codigo_invitacion}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Comparte este código con tu inquilino para vincularse</p>
                    </div>

                    {prop.vinculaciones && prop.vinculaciones.length > 0 && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-lg">
                        <p className="text-[10px] text-gray-500">Inquilinos vinculados:</p>
                        {prop.vinculaciones.map((v) => (
                          <div key={v.id} className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-800">I</div>
                            <span className="text-xs font-medium text-emerald-800">{v.inquilino_id.substring(0, 8)}...</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">{v.estado}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {prop.fotos && prop.fotos.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {prop.fotos.map((foto, i) => (
                          <img key={i} src={foto} alt="Propiedad" className="w-16 h-16 object-cover rounded-lg cursor-pointer" onClick={() => setFotoAmpliada(foto)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-900 mt-6 mb-3">Pagos recibidos</h2>

      <div className="flex flex-col gap-3">
        {pagos.map((pago) => (
          <div key={pago.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-900">${pago.monto} · {pago.metodo}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(pago.fecha_pago).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {pago.referencia && <p className="text-xs text-gray-400 mt-0.5">Ref: {pago.referencia}</p>}
                {pago.notas && <p className="text-xs text-blue-600 mt-0.5">{pago.notas}</p>}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${
                pago.estado === "confirmado" ? "bg-emerald-100 text-emerald-800" : pago.estado === "rechazado" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
              }`}>
                {pago.estado === "confirmado" ? "Confirmado" : pago.estado === "rechazado" ? "Rechazado" : "Pendiente"}
              </span>
            </div>

            {pago.comprobante_url && (
              <div className="mt-3">
                <a href={pago.comprobante_url} target="_blank" className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  📎 Ver comprobante adjunto
                </a>
              </div>
            )}

            {pago.estado === "pendiente" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => confirmarPago(pago.id)} className="flex-1 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors">
                  Confirmar ✓
                </button>
                <button onClick={() => rechazarPago(pago.id)} className="flex-1 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors">
                  Rechazar ✗
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {fotoAmpliada && (
        <div onClick={() => setFotoAmpliada(null)} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-pointer">
          <div className="relative max-w-lg w-full">
            <img src={fotoAmpliada} alt="Foto ampliada" className="w-full rounded-2xl" />
            <button onClick={() => setFotoAmpliada(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}