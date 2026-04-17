"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

 const opciones = [
    { icono: "👤", nombre: "Datos personales", color: "bg-blue-100", ruta: "/datos-personales" },
    { icono: "💳", nombre: "Métodos de pago", color: "bg-emerald-100", ruta: "/metodos-pago" },
    { icono: "📄", nombre: "Recibos y facturas", color: "bg-amber-100", ruta: "/recibos" },
    { icono: "🔔", nombre: "Notificaciones", color: "bg-pink-100", ruta: "/notificaciones" },
    { icono: "🔒", nombre: "Seguridad", color: "bg-purple-100", ruta: "/seguridad" },
    { icono: "⚙️", nombre: "Configuración", color: "bg-gray-100", ruta: "/configuracion" },
  ];

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Obtener los datos del usuario autenticado
      setUsuario({
        email: session.user.email,
        id: session.user.id,
        creado: new Date(session.user.created_at).toLocaleDateString("es-VE"),
      });
      setCargando(false);
    }
    cargar();
  }, []);

  // Funcion para cerrar sesion
  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  // Obtener las iniciales del email (antes del @)
  const nombre = usuario.email.split("@")[0];
  const iniciales = nombre.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">

      <div className="text-center mt-4">
        <div className="w-20 h-20 bg-emerald-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
          {iniciales}
        </div>
        <p className="text-lg font-semibold text-gray-900 mt-3">{nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5">{usuario.email}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Email</span>
            <span className="text-xs font-medium text-emerald-700">{usuario.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Miembro desde</span>
            <span className="text-xs font-medium text-gray-900">{usuario.creado}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {opciones.map((opcion) => (
          <Link
            href={opcion.ruta}
            key={opcion.nombre}
            className="flex items-center gap-3 py-3.5 border-b border-gray-100 cursor-pointer"
          >
            <div className={`w-9 h-9 ${opcion.color} rounded-xl flex items-center justify-center text-base`}>
              {opcion.icono}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-900">
              {opcion.nombre}
            </span>
            <span className="text-gray-400 text-sm">›</span>
          </Link>
        ))}
      </div>
<Link
        href="/propietario"
        className="block w-full py-3 mt-6 text-sm text-center text-emerald-700 font-medium border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
      >
        Panel del propietario →
      </Link>
      {/* BOTON CERRAR SESION - ahora funcional */}
      <button
        onClick={cerrarSesion}
        className="w-full py-3 mt-6 text-sm text-red-500 font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
      >
        Cerrar sesión
      </button>

    </div>
  );
}