import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup, isLogged, user, logout } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Si ya hay sesión iniciada, mostramos un mensajito (mismo estilo que LoginPage)
  if (isLogged) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-1">Ya iniciaste sesión</h1>
          <p className="text-gray-600 mb-6">
            Estás conectada como{" "}
            <span className="font-medium">
              {user?.name || user?.email?.split("@")[0] || "usuario"}
            </span>.
          </p>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Ir a comprar
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validaciones simples (mismo criterio que login)
    if (!name.trim()) return setError("Ingresá tu nombre.");
    if (!email.trim()) return setError("Ingresá tu correo.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Correo inválido.");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres.");

    setSubmitting(true);
    try {
      // ¡IMPORTANTE!: pasamos OBJETO, no JSON.stringify
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
      });

      // Redirigimos al login con el email como “sugerencia”
      navigate("/login", { replace: true, state: { email } });
    } catch (err) {
      const msg =
        err?.message ||
        "No se pudo crear la cuenta. Verificá los datos e intentá nuevamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Crear cuenta</h1>
        <p className="text-gray-600 mb-6">
          Completá tus datos para registrarte.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre y apellido
            </label>
            <input
              id="name"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-indigo-100 focus:ring-4"
              placeholder="Tu nombre"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-indigo-100 focus:ring-4"
              placeholder="tucorreo@mail.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password + toggle Ver */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-12 text-gray-900 outline-none ring-indigo-100 focus:ring-4"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                {showPwd ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {/* Teléfono (opcional) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono (opcional)
            </label>
            <input
              id="phone"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-indigo-100 focus:ring-4"
              placeholder="Ej: 1155555555"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-600">
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
