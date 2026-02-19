import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import RequireAdminAuth from "./components/RequireAdminAuth";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import LeadDetail from "./pages/admin/LeadDetail";
import Providers from "./pages/admin/Providers";

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAdminAuth />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="providers" element={<Providers />} />
        </Route>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
