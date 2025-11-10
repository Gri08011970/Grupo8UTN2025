import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import { useAuth } from "./context/AuthContext.jsx";

import HomePage from "./pages/HomePage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryDetailPage from "./pages/CategoryDetailPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx"; // 👈 NUEVO

function RedirectToDefaultCategory() {
  return <Navigate to="/categoria/mujer" replace />;
}

// Wrapper para rutas sólo admin
function AdminOnly({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-6">
        <Routes>
          {/* Inicio */}
          <Route path="/" element={<HomePage />} />

          {/* Redirecciones antiguas */}
          <Route path="/categorias" element={<RedirectToDefaultCategory />} />
          <Route path="/categoria" element={<RedirectToDefaultCategory />} />

          {/* Catálogo por categoría */}
          <Route path="/categoria/:slug" element={<CategoryDetailPage />} />
          {/* grilla general */}
          <Route path="/catalogo" element={<CategoriesPage />} />

          {/* Producto */}
          <Route path="/producto/:id" element={<ProductDetailPage />} />

          {/* Carrito */}
          <Route path="/carrito" element={<CartPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Admin */}
          <Route
            path="/admin/compras"
            element={
              <AdminOnly>
                <AdminOrdersPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <AdminOnly>
                <AdminProductsPage />
              </AdminOnly>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
