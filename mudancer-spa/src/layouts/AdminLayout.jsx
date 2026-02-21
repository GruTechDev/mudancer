import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { getAdminToken, setAdminToken } from "../api/client";

// ── Leads dropdown items ──────────────────────────────────────────────────────
const LEADS_ITEMS = [
  { label: "New Leads", to: "/admin/leads" },
  { label: "Quotes",    to: "/admin/cotizadas" },
  { label: "Orders",    to: "/admin/orders" },
];

function LeadsDropdown({ location }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = location.pathname.startsWith("/admin/leads") ||
                   location.pathname.startsWith("/admin/cotizadas") ||
                   location.pathname.startsWith("/admin/orders");

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "0.5rem 1rem", borderRadius: 8, border: "none",
          background: isActive ? "rgba(34,197,94,0.12)" : "transparent",
          color: isActive ? "#16a34a" : "#374151",
          fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
          fontFamily: "inherit", transition: "background 0.15s, color 0.15s",
          letterSpacing: "0.04em",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f3f4f6"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        LEADS
        <span style={{ fontSize: "0.65rem", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb", minWidth: 160, zIndex: 200,
          overflow: "hidden", animation: "ddFade 0.15s ease",
        }}>
          {LEADS_ITEMS.map(({ label, to }) => {
            const active = location.pathname === to || (to !== "/admin/leads" && location.pathname.startsWith(to));
            return (
              <Link
                key={to} to={to}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "0.625rem 1.125rem",
                  fontSize: "0.875rem", fontWeight: active ? 600 : 500,
                  color: active ? "#16a34a" : "#374151",
                  textDecoration: "none",
                  background: active ? "rgba(34,197,94,0.08)" : "transparent",
                  borderLeft: active ? "3px solid #22c55e" : "3px solid transparent",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const location = useLocation();
  const isLogin  = location.pathname === "/admin/login";
  const token    = getAdminToken();

  function handleLogout() {
    setAdminToken(null);
    window.location.href = "/admin/login";
  }

  if (isLogin || !token) return <Outlet />;

  const suppliersActive = location.pathname.startsWith("/admin/providers");

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ddFade { from{opacity:0;transform:translateX(-50%) translateY(-6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 1.25rem",
          height: 60,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}>

          {/* Left — Logo */}
          <Link to="/admin/leads" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🚛</span>
            <span style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#1e5a9e", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              Reliable<br />
              <span style={{ fontWeight: 600, color: "#22c55e", fontSize: "0.875rem" }}>Moving Admin</span>
            </span>
          </Link>

          {/* Center — Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <LeadsDropdown location={location} />

            <Link
              to="/admin/providers"
              style={{
                padding: "0.5rem 1rem", borderRadius: 8,
                background: suppliersActive ? "rgba(34,197,94,0.12)" : "transparent",
                color: suppliersActive ? "#16a34a" : "#374151",
                fontWeight: 600, fontSize: "0.9rem",
                textDecoration: "none", letterSpacing: "0.04em",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { if (!suppliersActive) e.currentTarget.style.background = "#f3f4f6"; }}
              onMouseLeave={(e) => { if (!suppliersActive) e.currentTarget.style.background = suppliersActive ? "rgba(34,197,94,0.12)" : "transparent"; }}
            >
              SUPPLIERS
            </Link>
          </nav>

          {/* Right — Logout */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.45rem 0.875rem", borderRadius: 8,
                border: "1.5px solid #e5e7eb", background: "#fff",
                color: "#6b7280", fontWeight: 600, fontSize: "0.85rem",
                cursor: "pointer", fontFamily: "inherit",
                transition: "border-color 0.15s, color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "#fff"; }}
            >
              <span>⎋</span> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
