import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "../../api/adminApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str.includes("T") ? str : str + "T00:00:00");
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function statusMeta(status) {
  switch (status) {
    case "published":   return { label: "Available",  color: "#2563eb", bg: "transparent" };
    case "adjudicated": return { label: "Awarded",    color: "#374151", bg: "transparent" };
    case "concluded":   return { label: "Completed",  color: "#059669", bg: "transparent" };
    default:            return { label: "New",        color: "#d97706", bg: "transparent" };
  }
}

// ── Lead Card ─────────────────────────────────────────────────────────────────

function LeadCard({ lead, onClick, isNew }) {
  const { label, color } = statusMeta(lead.status);
  const createdDate = fmtDate(lead.created_at);
  const idealDate   = fmtDate(lead.ideal_date);

  return (
    <div
      onClick={onClick}
      style={{
        background: isNew ? "#fff" : "#fff",
        borderRadius: 14,
        border: isNew ? "2px solid #22c55e" : "1.5px solid #e5e7eb",
        padding: "0.875rem 1.125rem",
        cursor: "pointer",
        transition: "box-shadow 0.18s, transform 0.15s",
        boxShadow: isNew ? "0 2px 12px rgba(34,197,94,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isNew ? "0 2px 12px rgba(34,197,94,0.18)" : "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top row: date | ID | name */}
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.375rem" }}>
        {isNew && (
          <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#22c55e", color: "#fff", borderRadius: 20, padding: "2px 7px", marginRight: 4, letterSpacing: "0.05em" }}>NEW</span>
        )}
        <span style={{ fontSize: isNew ? "0.9375rem" : "0.8125rem", fontWeight: isNew ? 700 : 500, color: "#1e293b" }}>
          {createdDate}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>|</span>
        <span style={{ fontSize: isNew ? "0.9375rem" : "0.8125rem", fontWeight: isNew ? 700 : 500, color: "#1e5a9e" }}>
          ID {lead.public_id || lead.id}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>|</span>
        <span style={{ fontSize: isNew ? "0.9375rem" : "0.8125rem", fontWeight: isNew ? 700 : 500, color: "#1e293b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lead.client_name || "—"}
        </span>
      </div>

      {/* Origin */}
      <p style={{ margin: "0 0 0.125rem", fontSize: "0.875rem", fontWeight: 500, color: "#16a34a" }}>
        {[lead.origin_state, lead.origin_city].filter(Boolean).join(", ") || "—"}
      </p>

      {/* Destination */}
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#dc2626" }}>
        {[lead.destination_state, lead.destination_city].filter(Boolean).join(", ") || "—"}
      </p>

      {/* Bottom row: date + status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{idealDate}</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [allLeads, setAllLeads]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef(null);
  const navigate    = useNavigate();

  const fetchLeads = useCallback(() => {
    setLoading(true);
    setError(null);
    getLeads()
      .then(setAllLeads)
      .catch((err) => setError(err.response?.data?.message || err.message || "Error loading leads"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  function handleSearchInput(value) {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 350);
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

  const newCount = allLeads.filter(l => l.is_new).length;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1rem 2.5rem" }}>

      {/* Title */}
      <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: "0 0 1rem" }}>
        LEADS
        {newCount > 0 && (
          <span style={{ marginLeft: 8, background: "#22c55e", color: "#fff", borderRadius: 20, fontSize: "0.7rem", padding: "2px 8px", fontWeight: 700, verticalAlign: "middle" }}>
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
            boxSizing: "border-box", transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#22c55e")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        />
        <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "1rem", pointerEvents: "none" }}>🔍</span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>Loading leads…
        </div>
      ) : error ? (
        <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "1rem", textAlign: "center" }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📋</div>
          {q ? `No leads found for "${search}"` : "No leads yet."}
        </div>
      ) : (
        <>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>
            {filtered.length} lead{filtered.length !== 1 ? "s" : ""} — click a card to view details
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isNew={!!lead.is_new}
                onClick={() => navigate(`/admin/leads/${lead.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
