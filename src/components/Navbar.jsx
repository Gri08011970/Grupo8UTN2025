import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition";
const linkActive =
  "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200";

const isActive = ({ isActive }) =>
  isActive ? `${linkBase} ${linkActive}` : linkBase;

export default function Navbar() {
  const { count } = useCart();
  const { user, isLogged, isAdmin, logout } = useAuth();

  const displayName =
    user?.name?.trim() || (user?.email ? user.email.split("@")[0] : "");

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="container mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          {/* Ícono Grupo 8 */}
          <img
            src="/images/logo_g8_gear_128.png"
            alt="Grupo 8 · UTN"
            className="h-12 w-12 rounded-full ring-1 ring-indigo-200"
            width="24"
            height="24"
          />
          <span className="text-xl font-semibold tracking-wide text-slate-900">
            Tienda de <span className="text-indigo-600">ropa</span>
          </span>
        </Link>

        {/* accesos rápidos */}
        <div className="flex items-center gap-1">
          <NavLink to="/categoria/mujer" className={isActive}>Mujer</NavLink>
          <NavLink to="/categoria/hombre" className={isActive}>Hombre</NavLink>
          <NavLink to="/categoria/unisex" className={isActive}>Unisex</NavLink>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <NavLink to="/carrito" className={isActive}>
            Carrito
            {count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                {count}
              </span>
            )}
          </NavLink>

{isAdmin && (
  <>
    <NavLink to="/admin/compras" className={isActive}>Compras</NavLink>
    <NavLink to="/admin/productos" className={isActive}>Productos</NavLink>
  </>
)}


          {!isLogged ? (
            <>
              <NavLink to="/login" className={isActive}>Iniciar sesión</NavLink>
              <NavLink to="/signup" className={isActive}>Registro</NavLink>
            </>
          ) : (
            <>
              <span className="px-2 text-sm text-slate-600">
                Hola, <span className="font-medium">{displayName}</span>
              </span>
              <button onClick={logout} className={linkBase}>
                Salir
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
