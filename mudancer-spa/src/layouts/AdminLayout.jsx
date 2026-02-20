import { Outlet, Link, useLocation } from "react-router-dom";
import { getAdminToken, setAdminToken } from "../api/client";

export default function AdminLayout() {
  const location = useLocation();
  const isLogin = location.pathname === "/admin/login";
  const token = getAdminToken();

  function handleLogout() {
    setAdminToken(null);
    window.location.href = "/admin/login";
  }

  if (isLogin) {
    return <Outlet />;
  }
  if (!token) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin/dashboard" className="text-lg font-bold text-primary">
            Admin Panel
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/admin/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === "/admin/dashboard" ? "bg-primary-50 text-primary" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/cotizadas"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname.startsWith("/admin/cotizadas") ? "bg-primary-50 text-primary" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Cotizadas
            </Link>
            <Link
              to="/admin/providers"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname.startsWith("/admin/providers") ? "bg-primary-50 text-primary" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Proveedores
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
