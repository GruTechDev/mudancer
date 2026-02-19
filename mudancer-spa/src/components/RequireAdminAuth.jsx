import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminToken } from "../api/client";

export default function RequireAdminAuth() {
  const location = useLocation();
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
