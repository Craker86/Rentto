"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("inquilino");
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    if (!email.trim()) {
      setMensaje("Error: Ingresa tu correo electrónico");
      setCargando(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMensaje("Error: El correo no es válido");
      setCargando(false);
      return;
    }

    if (password.length < 6) {
      setMensaje("Error: La contraseña debe tener mínimo 6 caracteres");
      setCargando(false);
      return;
    }

    if (esRegistro) {
      if (!nombre.trim()) {
        setMensaje("Error: Ingresa tu nombre");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMensaje("Error: " + error.message);
      } else {
        // Crear el perfil con el rol seleccionado
        if (data.user) {
          await supabase.from("perfiles").insert({
            id: data.user.id,
            rol: rol,
            nombre: nombre,
          });
        }
        setMensaje("Cuenta creada. Revisa tu email para confirmar.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMensaje("Error: " + (error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos" : error.message));
      } else {
        // Verificar el rol del usuario para redirigir
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("rol")
          .single();

        if (perfil?.rol === "propietario") {
          router.push("/propietario");
        } else {
          router.push("/dashboard");
        }
      }
    }

    setCargando(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
            R
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Rentto</h1>
          <p className="text-sm text-gray-500 mt-1">
            {esRegistro ? "Crea tu cuenta" : "Inicia sesión"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="space-y-4">

            {/* SELECTOR DE ROL - solo en registro */}
            {esRegistro && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">
                  ¿Qué eres?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRol("inquilino")}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      rol === "inquilino"
                        ? "bg-emerald-700 text-white"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    🏠 Inquilino
                  </button>
                  <button
                    type="button"
                    onClick={() => setRol("propietario")}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      rol === "propietario"
                        ? "bg-emerald-700 text-white"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    🔑 Propietario
                  </button>
                </div>
              </div>
            )}

            {/* CAMPO NOMBRE - solo en registro */}
            {esRegistro && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {mensaje && (
              <p className={`text-xs text-center ${mensaje.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>
                {mensaje}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={cargando || !email || !password}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                cargando || !email || !password
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              {cargando
                ? "Procesando..."
                : esRegistro
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </button>

          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setEsRegistro(!esRegistro);
              setMensaje("");
            }}
            className="text-emerald-700 font-medium"
          >
            {esRegistro ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>

      </div>
    </div>
  );
}