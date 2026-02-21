import { useState, useEffect, useCallback } from "react";
import { getOrdenes } from "../../api/adminApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str.includes("T") ? str : str + "T00:00:00");
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function fmtMoney(val) {
  if (val === null || val === undefined || val === "") return "—";
  return "$" + Number(val).toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

function Stars({ value, max = 5 }) {
  const n = Math.round(Number(value) || 0);
  return (
    <span style={{ color: "#f59e0b", fontSize: 14, letterSpacing: -1 }}>
      {"★".repeat(n)}{"☆".repeat(Math.max(0, max - n))}
      <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 5 }}>{n}/{max}</span>
    </span>
  );
}

function ProviderAvatar({ logo, nombre, size = 44 }) {
  const initial = (nombre || "?")[0].toUpperCase();
  if (logo) {
    return (
      <img
        src={logo}
        alt={nombre}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "#e5e7eb", display: "flex", alignItems: "center",
        justifyContent: "center", fontWeight: 700, fontSize: size * 0.38,
        color: "#6b7280", flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

// ── Document Button (dashed border, placeholder) ──────────────────────────────

function DocButton({ label }) {
  return (
    <button
      type="button"
      style={{
        width: "100%",
        padding: "14px 0",
        background: "#fff",
        border: "2px dashed #22c55e",
        borderRadius: 12,
        color: "#374151",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
      onClick={() => alert(`"${label}" PDF generation coming soon.`)}
    >
      {label}
    </button>
  );
}

// ── Lead Summary Card ─────────────────────────────────────────────────────────

function LeadCard({ order, selected, onClick }) {
  const isNew = order.is_new;
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: selected
          ? "2px solid #22c55e"
          : isNew
          ? "2px solid #f59e0b"
          : "1.5px solid #e5e7eb",
        padding: "0.875rem 1.125rem",
        cursor: "pointer",
        boxShadow: selected
          ? "0 2px 12px rgba(34,197,94,0.2)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.18s",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", alignItems: "baseline", marginBottom: "0.375rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>{fmtDate(order.created_at)}</span>
        <span style={{ color: "#94a3b8" }}>|</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e5a9e" }}>ID {order.public_id || order.id}</span>
        <span style={{ color: "#94a3b8" }}>|</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.client_name || "—"}</span>
      </div>
      <p style={{ margin: "0 0 2px", fontSize: "0.8375rem", fontWeight: 500, color: "#16a34a" }}>
        {[order.origin_state, order.origin_city].filter(Boolean).join(", ") || "—"}
      </p>
      <p style={{ margin: "0 0 6px", fontSize: "0.8375rem", fontWeight: 500, color: "#dc2626" }}>
        {[order.destination_state, order.destination_city].filter(Boolean).join(", ") || "—"}
      </p>
      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{fmtDate(order.ideal_date)}</span>
    </div>
  );
}

// ── Order Detail View ─────────────────────────────────────────────────────────

function OrderDetail({ order, onBack }) {
  const q = order.assigned_quote;
  const p = q?.provider;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          color: "#64748b", fontSize: 14, fontWeight: 500,
          marginBottom: 14, padding: 0,
        }}
      >
        ← Back to Orders
      </button>

      {/* Lead summary card */}
      <LeadCard order={order} selected={false} isNew={false} onClick={() => {}} />

      {/* Assigned supplier card */}
      {q && p && (
        <div
          style={{
            marginTop: 14,
            background: "#fff",
            border: "2px solid #22c55e",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 2px 14px rgba(34,197,94,0.15)",
          }}
        >
          <ProviderAvatar logo={p.logo} nombre={p.nombre} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#111827", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.nombre}
            </p>
            <Stars value={p.reputacion} />
          </div>
          <p style={{ fontWeight: 800, fontSize: 20, color: "#16a34a", margin: 0, flexShrink: 0 }}>
            {fmtMoney(q.precio_total)}
          </p>
        </div>
      )}

      {/* Supplier section */}
      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 10px" }}>
          Supplier
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DocButton label="Supplier Quote" />
          <DocButton label="Supplier Service Order" />
        </div>
      </div>

      {/* Client section */}
      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 10px" }}>
          Client
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DocButton label="Client Quote" />
          <DocButton label="Client Service Order" />
        </div>
      </div>

      {/* Quote notes */}
      {q?.notas && (
        <div style={{ marginTop: 20, background: "#f9fafb", borderRadius: 12, padding: "12px 16px" }}>
          <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500, margin: "0 0 4px" }}>Notes</p>
          <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.5 }}>{q.notas}</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Orders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    getOrdenes()
      .then(setOrders)
      .catch((err) => setError(err.response?.data?.message || err.message || "Error loading orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Detail view ─────────────────────────────────────────────────────────
  if (selectedOrder) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1rem 2.5rem" }}>
        <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: "0 0 1.25rem" }}>
          ORDER
        </h1>
        <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1rem 2.5rem" }}>

      <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: "0 0 1rem" }}>
        ORDERS
      </h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>Loading…
        </div>
      ) : error ? (
        <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "1rem", textAlign: "center" }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
          No assigned orders yet.
        </div>
      ) : (
        <>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} — click to view details
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {orders.map((order) => (
              <LeadCard
                key={order.id}
                order={order}
                selected={false}
                isNew={!!order.is_new}
                onClick={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
