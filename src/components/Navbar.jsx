// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const linkBase = "px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition";
const linkActive = "bg-gray-100 text-gray-900";

export default function Navbar() {
  const { count } = useCart();
  const isActive = ({ isActive }) => (isActive ? `${linkBase} ${linkActive}` : linkBase);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="container mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
          <img src="/logo.svg" alt="Tienda de ropa" width="24" height="24" />
          <span>Tienda de <span className="text-indigo-600">ropa</span></span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <NavLink to="/categorias" className={isActive}>Categorías</NavLink>

          <NavLink to="/carrito" className={isActive}>
            Carrito
            {count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                {count}
              </span>
            )}
          </NavLink>

          <NavLink to="/admin/compras" className={isActive}>Compras</NavLink>
          <NavLink to="/login" className={isActive}>Ingresar</NavLink>
          <NavLink to="/signup" className={isActive}>Registro</NavLink>
        </div>
      </nav>
    </header>
  );
}
