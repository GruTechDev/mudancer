import { useState, useEffect, useRef, useCallback } from "react";
import { getCotizadas, assignQuote } from "../../api/adminApi";

// ── Shared helpers ────────────────────────────────────────────────────────────

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
    <span style={{ color: "#f59e0b", fontSize: 13, letterSpacing: -1 }}>
      {"★".repeat(n)}{"☆".repeat(Math.max(0, max - n))}
      <span style={{ color: "#9ca3af", fontSize: 11, marginLeft: 4 }}>{n}/{max}</span>
    </span>
  );
}

function ProviderAvatar({ logo, nombre, size = 40 }) {
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

// ── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
          maxWidth: 360, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <h3 style={{ fontWeight: 700, fontSize: 17, color: "#111827", margin: "0 0 8px" }}>
          Assign this quote?
        </h3>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#f9fafb",
              color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: "none", background: loading ? "#86efac" : "#22c55e",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Assigning…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quote Detail Modal ────────────────────────────────────────────────────────

function QuoteModal({ quote, lead, onClose, onAssign }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [assigning, setAssigning]     = useState(false);
  const [error, setError]             = useState(null);
  const p = quote.provider;

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && !showConfirm) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, showConfirm]);

  async function doAssign() {
    setShowConfirm(false);
    setAssigning(true);
    setError(null);
    try {
      const result = await assignQuote(quote.id);
      onAssign(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error assigning.");
      setAssigning(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }} />
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 1101,
          background: "#fff", borderRadius: 18,
          width: "min(480px, 95vw)", maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, margin: 0, color: "#111827" }}>Quote Details</h2>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "16px 20px 24px", flex: 1 }}>
          {/* Provider card */}
          {p && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#f9fafb", borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
              <ProviderAvatar logo={p.logo} nombre={p.nombre} size={48} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "#111827", margin: "0 0 2px" }}>{p.nombre}</p>
                <Stars value={p.reputacion} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* Price breakdown */}
          <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 18 }}>
            {[
              ["Total Price",     quote.precio_total,  true],
              ["Deposit",         quote.apartado,      false],
              ["Advance Payment", quote.anticipo,       false],
              ["Final Payment",   quote.pago_final,    false],
              ["Insurance Rate",  quote.tarifa_seguro, false],
            ].map(([label, val, bold]) => (
              <div
                key={label}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid #f3f4f6",
                  background: bold ? "#f0fdf4" : "#fff",
                }}
              >
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: bold ? 600 : 400 }}>{label}</span>
                <span style={{ fontSize: bold ? 17 : 14, fontWeight: bold ? 700 : 500, color: bold ? "#16a34a" : "#111827" }}>
                  {val !== null && val !== undefined && val !== "" ? fmtMoney(val) : "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {quote.notas && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500, margin: "0 0 4px" }}>Notes</p>
              <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.5 }}>{quote.notas}</p>
            </div>
          )}

          {/* Customer interest badge */}
          {quote.cliente_interesada && (
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 14px", marginBottom: 18, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
              ⭐ Customer has shown interest in this quote
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 10,
              border: "1.5px solid #e5e7eb", background: "#fff",
              color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={assigning || quote.seleccionada}
            style={{
              flex: 2, padding: "12px 0", borderRadius: 10,
              border: "none",
              background: quote.seleccionada ? "#d1fae5" : assigning ? "#86efac" : "#22c55e",
              color: quote.seleccionada ? "#065f46" : "#fff",
              fontSize: 14, fontWeight: 700,
              cursor: (assigning || quote.seleccionada) ? "not-allowed" : "pointer",
            }}
          >
            {quote.seleccionada ? "✓ Already Assigned" : assigning ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={`Assign this lead to ${p?.nombre ?? "this supplier"}? This will move the lead to the Orders page.`}
          onConfirm={doAssign}
          onCancel={() => setShowConfirm(false)}
          loading={assigning}
        />
      )}
    </>
  );
}

// ── Lead Summary Card (compact) ───────────────────────────────────────────────

function LeadSummaryCard({ lead, selected, onClick, isNew }) {
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
        transition: "box-shadow 0.18s, transform 0.15s",
        boxShadow: selected
          ? "0 2px 12px rgba(34,197,94,0.2)"
          : isNew
          ? "0 2px 12px rgba(245,158,11,0.18)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.boxShadow = isNew ? "0 2px 12px rgba(245,158,11,0.18)" : "0 1px 4px rgba(0,0,0,0.06)"; }}
    >
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.375rem" }}>
        {isNew && (
          <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#f59e0b", color: "#fff", borderRadius: 20, padding: "2px 7px", marginRight: 4, letterSpacing: "0.05em" }}>NEW</span>
        )}
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>{fmtDate(lead.created_at)}</span>
        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>|</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e5a9e" }}>ID {lead.public_id || lead.id}</span>
        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>|</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.client_name || "—"}</span>
      </div>
      <p style={{ margin: "0 0 2px", fontSize: "0.8375rem", fontWeight: 500, color: "#16a34a" }}>
        {[lead.origin_state, lead.origin_city].filter(Boolean).join(", ") || "—"}
      </p>
      <p style={{ margin: "0 0 6px", fontSize: "0.8375rem", fontWeight: 500, color: "#dc2626" }}>
        {[lead.destination_state, lead.destination_city].filter(Boolean).join(", ") || "—"}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{fmtDate(lead.ideal_date)}</span>
        {(lead.quotes_count ?? 0) > 0 && (
          <span style={{
            fontSize: "0.72rem", fontWeight: 700,
            background: (lead.new_quotes ?? 0) > 0 ? "#fef3c7" : "#f3f4f6",
            color: (lead.new_quotes ?? 0) > 0 ? "#92400e" : "#6b7280",
            borderRadius: 20, padding: "2px 8px",
          }}>
            {lead.quotes_count} quote{lead.quotes_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Quote Card ────────────────────────────────────────────────────────────────

function QuoteCard({ quote, onClick }) {
  const p           = quote.provider;
  const isSelected  = quote.seleccionada;
  const isInterested = quote.cliente_interesada;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: isSelected
          ? "2px solid #22c55e"
          : isInterested
          ? "2px solid #f59e0b"
          : "1.5px solid #e5e7eb",
        padding: "14px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: isSelected
          ? "0 2px 14px rgba(34,197,94,0.18)"
          : isInterested
          ? "0 2px 12px rgba(245,158,11,0.15)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.18s, transform 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isSelected ? "0 2px 14px rgba(34,197,94,0.18)" : isInterested ? "0 2px 12px rgba(245,158,11,0.15)" : "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <ProviderAvatar logo={p?.logo} nombre={p?.nombre ?? "?"} size={44} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p?.nombre ?? "Unknown supplier"}
        </p>
        <Stars value={p?.reputacion ?? 0} />
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 17, color: isSelected ? "#16a34a" : "#111827", margin: 0 }}>
          {fmtMoney(quote.precio_total)}
        </p>
        {isSelected && (
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#16a34a", letterSpacing: "0.04em" }}>ASSIGNED</span>
        )}
        {isInterested && !isSelected && (
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#d97706", letterSpacing: "0.04em" }}>CLIENT ★</span>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Cotizadas() {
  const [allLeads, setAllLeads]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [selectedLead, setSelectedLead] = useState(null); // The lead currently being viewed
  const [selectedQuote, setSelectedQuote] = useState(null); // The quote modal
  const debounceRef = useRef(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    setError(null);
    getCotizadas()
      .then((leads) => {
        setAllLeads(leads);
        // Keep selectedLead in sync if it's still in the list
        setSelectedLead((prev) => {
          if (!prev) return null;
          return leads.find((l) => l.id === prev.id) ?? null;
        });
      })
      .catch((err) => setError(err.response?.data?.message || err.message || "Error loading quotes"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  function handleSearchInput(value) {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 350);
  }

  // Called when admin assigns a quote — move the lead out of the Quotes list
  function handleAssigned(result) {
    const assignedLeadId = result?.data?.lead?.id;
    if (assignedLeadId) {
      setAllLeads((prev) => prev.filter((l) => l.id !== assignedLeadId));
    }
    setSelectedLead(null);
    setSelectedQuote(null);
  }

  const q = search.trim().toLowerCase();
  const filtered = allLeads.filter((l) => {
    if (!q) return true;
    return (
      (l.client_name  || "").toLowerCase().includes(q) ||
      (l.public_id    || "").toLowerCase().includes(q) ||
      (l.origin_state || "").toLowerCase().includes(q) ||
      (l.origin_city  || "").toLowerCase().includes(q) ||
      (l.destination_state || "").toLowerCase().includes(q) ||
      (l.destination_city  || "").toLowerCase().includes(q)
    );
  });

  const newCount = allLeads.filter((l) => l.is_new).length;

  // ── Detail view ───────────────────────────────────────────────────────────
  if (selectedLead) {
    const quotes = selectedLead.quotes ?? [];
    // Sort: client-interested first, then by price desc
    const sorted = [...quotes].sort((a, b) => {
      if (a.cliente_interesada && !b.cliente_interesada) return -1;
      if (!a.cliente_interesada && b.cliente_interesada) return 1;
      if (a.seleccionada && !b.seleccionada) return -1;
      if (!a.seleccionada && b.seleccionada) return 1;
      return Number(b.precio_total) - Number(a.precio_total);
    });

    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1rem 2.5rem" }}>

        {/* Back button */}
        <button
          onClick={() => setSelectedLead(null)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            color: "#64748b", fontSize: 14, fontWeight: 500,
            marginBottom: 14, padding: 0,
          }}
        >
          ← Back to Quotes
        </button>

        {/* Selected lead summary */}
        <LeadSummaryCard lead={selectedLead} selected={false} isNew={false} onClick={() => {}} />

        {/* Quotes section */}
        <div style={{ margin: "18px 0 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            Supplier Quotes
          </p>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{sorted.length} quote{sorted.length !== 1 ? "s" : ""}</span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📭</div>
            No supplier quotes yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {sorted.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onClick={() => setSelectedQuote(quote)}
              />
            ))}
          </div>
        )}

        {/* Quote detail modal */}
        {selectedQuote && (
          <QuoteModal
            quote={selectedQuote}
            lead={selectedLead}
            onClose={() => setSelectedQuote(null)}
            onAssign={handleAssigned}
          />
        )}
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1rem 2.5rem" }}>

      {/* Title */}
      <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: "0 0 1rem" }}>
        QUOTED
        {newCount > 0 && (
          <span style={{ marginLeft: 8, background: "#f59e0b", color: "#fff", borderRadius: 20, fontSize: "0.7rem", padding: "2px 8px", fontWeight: 700, verticalAlign: "middle" }}>
            {newCount} new
          </span>
        )}
      </h1>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Search by name, ID, origin or destination…"
          style={{
            width: "100%", padding: "0.625rem 2.5rem 0.625rem 0.875rem",
            fontSize: "0.9rem", fontFamily: "inherit",
            border: "1.5px solid #e5e7eb", borderRadius: 10,
            outline: "none", color: "#1e293b", background: "#fff",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        />
        <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>Loading…
        </div>
      ) : error ? (
        <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "1rem", textAlign: "center" }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📄</div>
          {q ? `No quotes found for "${search}"` : "No published leads yet."}
        </div>
      ) : (
        <>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>
            {filtered.length} lead{filtered.length !== 1 ? "s" : ""} — click to view quotes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {filtered.map((lead) => (
              <LeadSummaryCard
                key={lead.id}
                lead={lead}
                selected={selectedLead?.id === lead.id}
                isNew={!!lead.is_new}
                onClick={() => { setSelectedLead(lead); setSelectedQuote(null); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
