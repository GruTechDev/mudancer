import { useState, useEffect, useCallback, useRef } from "react";
import { getProviders, createProvider, updateProvider } from "../../api/adminApi";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toStars(value) {
  if (value == null) return 0;
  const n = parseFloat(value);
  return Math.min(5, Math.round(n <= 5 ? n : (n / 100) * 5));
}

function avatarBg(name) {
  const colors = ["#1e5a9e", "#16a34a", "#9333ea", "#dc2626", "#d97706", "#0891b2", "#be185d"];
  const ch = (name || "?").charCodeAt(0) ?? 0;
  return colors[ch % colors.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ nombre, logo, size = 52 }) {
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => setImgOk(true), [logo]);

  if (logo && imgOk) {
    return (
      <img
        src={logo}
        alt={nombre}
        onError={() => setImgOk(false)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: avatarBg(nombre), color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.42, flexShrink: 0,
      border: "2px solid #e2e8f0",
    }}>
      {(nombre || "?")[0].toUpperCase()}
    </div>
  );
}

/** Read-only stars for the card list */
function StarsBadge({ value }) {
  const stars = toStars(value);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginRight: 2 }}>{stars}/5</span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: "0.95rem", color: i <= stars ? "#f59e0b" : "#d1d5db", lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

/** Interactive stars for the modal */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const stars = toStars(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", minWidth: 28 }}>{stars}/5</span>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: "2rem", lineHeight: 1, cursor: "pointer",
            color: i <= (hovered || stars) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.12s, transform 0.1s",
            transform: hovered === i ? "scale(1.25)" : "scale(1)",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function InfoChip({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem", fontSize: "0.8rem", color: "#64748b" }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span><span style={{ fontWeight: 600, color: "#475569" }}>{label}:</span> {value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Card (list item)
// ─────────────────────────────────────────────────────────────────────────────

function ProviderCard({ provider, onClick }) {
  const { nombre, domicilio, responsable, telefono, rfc, logo, reputacion, email, completed_count } = provider;
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        padding: "1rem 1.125rem",
        display: "flex", gap: "0.875rem", alignItems: "flex-start",
        cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <Avatar nombre={nombre} logo={logo} size={50} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: "0.25rem" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {nombre || "—"}
          </p>
          {completed_count > 0 && (
            <span style={{ flexShrink: 0, fontSize: "0.72rem", fontWeight: 600, background: "#d1fae5", color: "#065f46", borderRadius: 20, padding: "2px 8px" }}>
              ✓ {completed_count} completed
            </span>
          )}
        </div>
        <StarsBadge value={reputacion} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginTop: "0.35rem" }}>
          <InfoChip icon="📍" label="Address"     value={domicilio} />
          <InfoChip icon="👤" label="Responsible" value={responsable} />
          <InfoChip icon="📞" label="Phone"       value={telefono} />
          <InfoChip icon="✉️"  label="Email"       value={email} />
          <InfoChip icon="🗂" label="RFC"         value={rfc} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Modal (edit)
// ─────────────────────────────────────────────────────────────────────────────

function ProviderModal({ provider, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre:      provider.nombre      ?? "",
    rfc:         provider.rfc         ?? "",
    domicilio:   provider.domicilio   ?? "",
    responsable: provider.responsable ?? "",
    telefono:    provider.telefono    ?? "",
    email:       provider.email       ?? "",
    logo:        provider.logo        ?? "",
    reputacion:  toStars(provider.reputacion),
  });
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);
    try {
      const saved = await updateProvider(provider.id, form);
      setSuccess(true);
      onSaved(saved);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setErrors({ _general: data?.message || err.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const inputStyle = (key) => ({
    width: "100%", padding: "0.625rem 0.75rem", fontSize: "0.9375rem",
    fontFamily: "inherit", color: "#1e293b", background: "#f8fafc",
    border: `1.5px solid ${errors[key] ? "#dc2626" : "#e2e8f0"}`,
    borderRadius: 10, boxSizing: "border-box", outline: "none",
    transition: "border-color 0.2s",
  });

  const labelStyle = { display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" };

  const stars = form.reputacion;

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        .modal-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .modal-scroll::-webkit-scrollbar { width: 5px; }
        .modal-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      <div
        className="modal-scroll"
        style={{
          background: "#fff", borderRadius: 20,
          width: "100%", maxWidth: 440,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "slideUp 0.22s ease",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, color: "#1e293b" }}>Supplier Profile</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.375rem", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 4 }}
            aria-label="Close"
          >×</button>
        </div>

        <form onSubmit={handleSave} style={{ padding: "1rem 1.25rem 1.5rem" }}>

          {/* ── Avatar + logo URL ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", padding: "1rem", background: "#f8fafc", borderRadius: 14 }}>
            <Avatar nombre={form.nombre} logo={form.logo} size={80} />
            <div style={{ width: "100%" }}>
              <label style={labelStyle}>Logo URL (optional)</label>
              <input
                className="modal-input"
                style={inputStyle("logo")}
                type="url"
                value={form.logo}
                onChange={(e) => set("logo", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* ── Reputation / Stars ── */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem", marginBottom: "1rem", textAlign: "center" }}>
            <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#475569", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Reputation</p>
            <StarPicker value={stars} onChange={(v) => set("reputacion", v)} />
            {provider.completed_count > 0 && (
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#22c55e", fontWeight: 600 }}>
                ✓ Completed: {provider.completed_count} move{provider.completed_count !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* ── Company info ── */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 700, color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Company</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input className="modal-input" style={inputStyle("nombre")} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Company name" />
                {errors.nombre && <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>{errors.nombre}</p>}
              </div>
              <div>
                <label style={labelStyle}>RFC</label>
                <input className="modal-input" style={inputStyle("rfc")} value={form.rfc} onChange={(e) => set("rfc", e.target.value)} placeholder="RFC" />
                {errors.rfc && <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>{errors.rfc}</p>}
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <textarea
                  className="modal-input"
                  style={{ ...inputStyle("domicilio"), resize: "vertical", minHeight: 64 }}
                  value={form.domicilio}
                  onChange={(e) => set("domicilio", e.target.value)}
                  placeholder="Full address"
                />
                {errors.domicilio && <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>{errors.domicilio}</p>}
              </div>
            </div>
          </div>

          {/* ── Contact info ── */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 700, color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Responsible Name</label>
                <input className="modal-input" style={inputStyle("responsable")} value={form.responsable} onChange={(e) => set("responsable", e.target.value)} placeholder="Full name" />
                {errors.responsable && <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>{errors.responsable}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input className="modal-input" style={inputStyle("telefono")} type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+52 55 1234 5678" />
                {errors.telefono && <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>{errors.telefono}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input className="modal-input" style={inputStyle("email")} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@company.com" />
                {errors.email && <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>{errors.email[0] ?? errors.email}</p>}
              </div>
            </div>
          </div>

          {/* ── General error ── */}
          {errors._general && (
            <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "0.75rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
              {errors._general}
            </div>
          )}

          {/* ── Success ── */}
          {success && (
            <div style={{ background: "#d1fae5", color: "#065f46", borderRadius: 10, padding: "0.75rem", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center", fontWeight: 600 }}>
              ✓ Changes saved successfully
            </div>
          )}

          {/* ── Save button ── */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%", padding: "0.9rem", fontSize: "1rem", fontWeight: 700,
              fontFamily: "inherit", color: "#fff", background: saving ? "#86efac" : "#22c55e",
              border: "none", borderRadius: 14, cursor: saving ? "not-allowed" : "pointer",
              transition: "background 0.2s, transform 0.15s",
              boxShadow: "0 3px 12px rgba(34,197,94,0.35)",
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#16a34a"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "#22c55e"; }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Front-end validation for Add form
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

function validateAdd(f) {
  const e = {};
  if (!f.nombre.trim())      e.nombre      = "Company name is required.";
  if (!f.rfc.trim())         e.rfc         = "RFC is required.";
  if (!f.domicilio.trim())   e.domicilio   = "Address is required.";
  if (!f.responsable.trim()) e.responsable = "Responsible name is required.";

  if (!f.telefono.trim())              e.telefono = "Phone is required.";
  else if (!PHONE_RE.test(f.telefono)) e.telefono = "Phone must be exactly 10 digits (0–9 only).";

  if (!f.email.trim())               e.email = "Email is required.";
  else if (!EMAIL_RE.test(f.email))  e.email = "Please enter a valid email address.";

  if (!f.password)               e.password = "Password is required.";
  else if (f.password.length < 6) e.password = "Password must be at least 6 characters.";

  return e;
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Provider Modal
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { nombre: "", rfc: "", domicilio: "", responsable: "", telefono: "", email: "", password: "", logo: "", reputacion: 0 };

function AddProviderModal({ onClose, onCreated }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [showPw, setShowPw]   = useState(false);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validateAdd(form);
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setSaving(true);
    try {
      const created = await createProvider(form);
      onCreated(created);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      } else {
        setErrors({ _general: data?.message || err.message || "Failed to create supplier." });
      }
    } finally {
      setSaving(false);
    }
  }

  function handleBackdrop(e) { if (e.target === e.currentTarget) onClose(); }

  const inp = (key) => ({
    className: "modal-input",
    style: {
      width: "100%", padding: "0.625rem 0.75rem", fontSize: "0.9375rem",
      fontFamily: "inherit", color: "#1e293b", background: "#f8fafc",
      border: `1.5px solid ${errors[key] ? "#dc2626" : "#e2e8f0"}`,
      borderRadius: 10, boxSizing: "border-box", outline: "none", transition: "border-color 0.2s",
    },
  });
  const lbl = { display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" };
  const err = (key) => errors[key] && <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#dc2626" }}>⚠ {errors[key]}</p>;

  return (
    <div onClick={handleBackdrop} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.18s ease" }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}           to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .modal-input:focus { border-color:#22c55e!important; box-shadow:0 0 0 3px rgba(34,197,94,0.15); }
        .modal-scroll::-webkit-scrollbar{width:5px}
        .modal-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:10px}
      `}</style>

      <div className="modal-scroll" style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "slideUp 0.22s ease" }}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, color: "#1e293b" }}>Add Supplier</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.375rem", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ padding: "1rem 1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>

          {/* Logo + avatar preview */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.625rem" }}>
            <Avatar nombre={form.nombre} logo={form.logo} size={72} />
            <div style={{ width: "100%" }}>
              <label style={lbl}>Logo URL (optional)</label>
              <input {...inp("logo")} type="url" value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
          </div>

          {/* Reputation */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem", textAlign: "center" }}>
            <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Initial Reputation</p>
            <StarPicker value={form.reputacion} onChange={(v) => set("reputacion", v)} />
          </div>

          {/* Company info */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 700, color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Company</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={lbl}>Company Name *</label>
                <input {...inp("nombre")} type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="e.g. Moreno Moving" />
                {err("nombre")}
              </div>
              <div>
                <label style={lbl}>RFC *</label>
                <input {...inp("rfc")} type="text" value={form.rfc} onChange={(e) => set("rfc", e.target.value)} placeholder="e.g. MMO870312AB1" />
                {err("rfc")}
              </div>
              <div>
                <label style={lbl}>Address *</label>
                <textarea {...inp("domicilio")} style={{ ...inp("domicilio").style, resize: "vertical", minHeight: 64 }} value={form.domicilio} onChange={(e) => set("domicilio", e.target.value)} placeholder="Full address" />
                {err("domicilio")}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 700, color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={lbl}>Responsible Name *</label>
                <input {...inp("responsable")} type="text" value={form.responsable} onChange={(e) => set("responsable", e.target.value)} placeholder="Full name" />
                {err("responsable")}
              </div>
              <div>
                <label style={lbl}>Phone * (10 digits)</label>
                <input {...inp("telefono")} type="tel" value={form.telefono}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); set("telefono", v); }}
                  placeholder="5512345678" maxLength={10} />
                {err("telefono")}
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>{form.telefono.length}/10 digits</p>
              </div>
              <div>
                <label style={lbl}>Email *</label>
                <input {...inp("email")} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@company.com" />
                {err("email")}
              </div>
            </div>
          </div>

          {/* Access / password */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 700, color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Access</p>
            <div>
              <label style={lbl}>Password * (min. 6 characters)</label>
              <div style={{ position: "relative" }}>
                <input {...inp("password")} type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" style={{ ...inp("password").style, paddingRight: "2.75rem" }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.1rem", padding: 0, lineHeight: 1 }}>{showPw ? "🙈" : "👁️"}</button>
              </div>
              {err("password")}
            </div>
          </div>

          {/* General error */}
          {errors._general && (
            <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "0.75rem", fontSize: "0.875rem" }}>⚠ {errors._general}</div>
          )}

          {/* Save */}
          <button type="submit" disabled={saving}
            style={{ width: "100%", padding: "0.9rem", fontSize: "1rem", fontWeight: 700, fontFamily: "inherit", color: "#fff", background: saving ? "#86efac" : "#22c55e", border: "none", borderRadius: 14, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 12px rgba(34,197,94,0.35)", transition: "background 0.2s" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#16a34a"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = saving ? "#86efac" : "#22c55e"; }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({ currentPage, lastPage, onPageChange }) {
  if (lastPage <= 1) return null;
  const pages = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const btn = (label, page, disabled, active) => (
    <button key={label + page} onClick={() => !disabled && typeof page === "number" && onPageChange(page)} disabled={disabled}
      style={{ minWidth: 36, height: 36, padding: "0 10px", borderRadius: 8, border: "1.5px solid", borderColor: active ? "#22c55e" : "#e2e8f0", background: active ? "#22c55e" : "#fff", color: active ? "#fff" : disabled ? "#cbd5e0" : "#475569", fontWeight: active ? 700 : 500, fontSize: "0.875rem", cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
      {btn("‹", currentPage - 1, currentPage === 1, false)}
      {pages.map((p, i) => p === "…" ? <span key={`e${i}`} style={{ color: "#94a3b8", padding: "0 4px" }}>…</span> : btn(p, p, false, p === currentPage))}
      {btn("›", currentPage + 1, currentPage === lastPage, false)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

export default function Providers() {
  const [providers, setProviders]       = useState([]);
  const [meta, setMeta]                 = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage]                 = useState(1);
  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [searchBy, setSearchBy]         = useState("nombre");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null); // edit modal
  const [showAdd, setShowAdd]           = useState(false); // add modal
  const debounceRef = useRef(null);

  const fetchProviders = useCallback((pg, q, by) => {
    setLoading(true);
    setError(null);
    getProviders({ page: pg, search: q, searchBy: by, perPage: PER_PAGE })
      .then((res) => {
        setProviders(res.data ?? []);
        setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total });
      })
      .catch((err) => setError(err.response?.data?.message || err.message || "Error loading providers"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProviders(page, search, searchBy); }, [page, search, searchBy, fetchProviders]);

  function handleSearchInput(value) {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setSearch(value); }, 400);
  }

  function handleSearchByChange(by) { setSearchBy(by); setPage(1); setSearch(searchInput); }

  /** Edit modal: patch provider in list in-place */
  function handleSaved(updated) {
    setProviders(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
  }

  /** Add modal: prepend new provider and refresh total count */
  function handleCreated(created) {
    setProviders(prev => [created, ...prev]);
    setMeta(m => ({ ...m, total: m.total + 1 }));
    setShowAdd(false);
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "1.25rem 1rem 2rem" }}>

      {/* Title */}
      <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: "0 0 1.125rem" }}>
        Suppliers
      </h1>

      {/* Search */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1.5px solid #e2e8f0", flexShrink: 0 }}>
            {[{ value: "nombre", label: "Name" }, { value: "telefono", label: "Phone" }].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => handleSearchByChange(value)}
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, border: "none", cursor: "pointer", background: searchBy === value ? "#22c55e" : "#fff", color: searchBy === value ? "#fff" : "#64748b", transition: "background 0.15s, color 0.15s", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
          <input
            type={searchBy === "telefono" ? "tel" : "text"}
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={searchBy === "telefono" ? "Search by phone…" : "Search by company name…"}
            style={{ flex: 1, padding: "0.5rem 0.875rem", fontSize: "0.9rem", fontFamily: "inherit", border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none", color: "#1e293b", background: "#fff", transition: "border-color 0.2s" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#22c55e")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          />

          {/* Add supplier button */}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            title="Add supplier"
            style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: "#22c55e", color: "#fff", fontSize: "1.375rem", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(34,197,94,0.35)", transition: "background 0.2s, transform 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.transform = "scale(1.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#22c55e"; e.currentTarget.style.transform = "scale(1)"; }}
          >+</button>
        </div>
        {!loading && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
            {meta.total} supplier{meta.total !== 1 ? "s" : ""} found — click a card to edit
          </p>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>Loading suppliers…
        </div>
      ) : error ? (
        <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "1rem", textAlign: "center" }}>{error}</div>
      ) : providers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</div>
          {search ? `No suppliers found for "${search}"` : "No suppliers registered yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        onPageChange={(pg) => { setPage(pg); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      />

      {/* Edit modal */}
      {selected && (
        <ProviderModal
          provider={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddProviderModal
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
