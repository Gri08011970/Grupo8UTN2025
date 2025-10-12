import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate("/");
    } catch (e) {
      setErr(e.message || "No se pudo registrar");
    }
  };

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Registro</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input w-full"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <input
          className="input w-full"
          placeholder="tucorreo@mail.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="input w-full"
          placeholder="********"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button className="btn-primary w-full">Crear cuenta</button>
        {err && <p className="text-red-600 bg-red-50 rounded p-2">{err}</p>}
      </form>
    </section>
  );
}

