import { Outlet, Link, useLocation } from "react-router-dom";
import { getProviderToken, setProviderToken } from "../api/proveedorClient";

export default function ProveedorLayout() {
  const location = useLocation();
  const isLogin = location.pathname === "/proveedor/login";
  const token = getProviderToken();

  function handleLogout() {
    setProviderToken(null);
    window.location.href = "/proveedor/login";
  }

  if (isLogin) return <Outlet />;
  if (!token) return <Outlet />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <nav className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <Link
                to="/proveedor/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  location.pathname === "/proveedor/dashboard" || location.pathname.startsWith("/proveedor/leads")
                    ? "bg-primary-100 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                LEADS
              </Link>
              <Link
                to="/proveedor/ordenes"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  location.pathname === "/proveedor/ordenes"
                    ? "bg-primary-100 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                ORDENES
              </Link>
              <span className="px-3 py-2 text-sm font-medium text-gray-400 cursor-default">AYUDA</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-red-600"
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
