import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ProveedorLayout from "./layouts/ProveedorLayout";
import RequireAdminAuth from "./components/RequireAdminAuth";
import RequireProveedorAuth from "./components/RequireProveedorAuth";
import AdminLogin from "./pages/admin/Login";
import AdminLeadsList from "./pages/admin/Dashboard";
import Providers from "./pages/admin/Providers";
import Cotizadas from "./pages/admin/Cotizadas";
import Orders from "./pages/admin/Orders";
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
          {/* New Leads */}
          <Route path="leads"     element={<AdminLeadsList />} />
          {/* Quotes */}
          <Route path="cotizadas" element={<Cotizadas />} />
          {/* Orders */}
          <Route path="orders"    element={<Orders />} />
          {/* Suppliers */}
          <Route path="providers" element={<Providers />} />
          {/* Legacy redirects */}
          <Route path="dashboard" element={<Navigate to="/admin/leads"     replace />} />
          <Route path="cotizadas/:id" element={<Navigate to="/admin/cotizadas" replace />} />
          <Route path="leads/:id"    element={<Navigate to="/admin/leads"     replace />} />
        </Route>
        <Route index element={<Navigate to="/admin/leads" replace />} />
      </Route>

      <Route path="/proveedor" element={<ProveedorLayout />}>
        <Route path="login" element={<ProveedorLogin />} />
        <Route element={<RequireProveedorAuth />}>
          <Route path="dashboard" element={<ProveedorDashboard />} />
          <Route path="leads/:id" element={<ProveedorLeadDetail />} />
          <Route path="ordenes"   element={<Ordenes />} />
        </Route>
        <Route index element={<Navigate to="/proveedor/dashboard" replace />} />
      </Route>

      <Route path="/cotizacion" element={<Cotizacion />} />

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
