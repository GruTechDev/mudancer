import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ProveedorLayout from "./layouts/ProveedorLayout";
import RequireAdminAuth from "./components/RequireAdminAuth";
import RequireProveedorAuth from "./components/RequireProveedorAuth";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLeadDetail from "./pages/admin/LeadDetail";
import Providers from "./pages/admin/Providers";
import Cotizadas from "./pages/admin/Cotizadas";
import CotizadasDetail from "./pages/admin/CotizadasDetail";
import ProveedorLogin from "./pages/proveedor/Login";
import ProveedorDashboard from "./pages/proveedor/Dashboard";
import ProveedorLeadDetail from "./pages/proveedor/LeadDetail";
import Ordenes from "./pages/proveedor/Ordenes";
import Cotizacion from "./pages/cotizacion/Cotizacion";

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<RequireAdminAuth />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="leads/:id" element={<AdminLeadDetail />} />
          <Route path="cotizadas" element={<Cotizadas />} />
          <Route path="cotizadas/:id" element={<CotizadasDetail />} />
          <Route path="providers" element={<Providers />} />
        </Route>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="/proveedor" element={<ProveedorLayout />}>
        <Route path="login" element={<ProveedorLogin />} />
        <Route element={<RequireProveedorAuth />}>
          <Route path="dashboard" element={<ProveedorDashboard />} />
          <Route path="leads/:id" element={<ProveedorLeadDetail />} />
          <Route path="ordenes" element={<Ordenes />} />
        </Route>
        <Route index element={<Navigate to="/proveedor/dashboard" replace />} />
      </Route>

      <Route path="/cotizacion" element={<Cotizacion />} />

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
