import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getProviderToken } from "../api/proveedorClient";

export default function RequireProveedorAuth() {
  const location = useLocation();
  const token = getProviderToken();

  if (!token) {
    return <Navigate to="/proveedor/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
