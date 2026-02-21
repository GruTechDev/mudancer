import { useState, useEffect, useCallback } from "react";
import { getLead, updateLead, publishLead, adjudicarLead, concluirLead } from "../../api/adminApi";

// ── Small helpers ────────────────────────────────────────────────────────────

function fmtCurrency(val) {
  if (val === null || val === undefined || val === "") return "—";
  return "$" + Number(val).toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 48,
        height: 26,
        borderRadius: 13,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "#22c55e" : "#d1d5db",
        transition: "background 0.2s",
        padding: 0,
        flexShrink: 0,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: checked ? 24 : 2,
          top: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, fontWeight: 500 }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Input({ value, onChange, name, type = "text", placeholder = "", required, maxLength, pattern, style }) {
  return (
    <input
      name={name}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      pattern={pattern}
      style={{
        width: "100%",
        padding: "8px 10px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontSize: 14,
        color: "#111827",
        outline: "none",
        background: "#f9fafb",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function Textarea({ value, onChange, name, rows = 3, placeholder = "" }) {
  return (
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 10px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontSize: 14,
        color: "#111827",
        outline: "none",
        background: "#f9fafb",
        resize: "vertical",
        boxSizing: "border-box",
      }}
    />
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontWeight: 600, fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", margin: "18px 0 10px", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
      {children}
    </p>
  );
}

// ── Confirmation dialog ──────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
          maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
        <h3 style={{ fontWeight: 700, fontSize: 17, color: "#111827", margin: "0 0 8px" }}>
          Publish this lead?
        </h3>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
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
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: "none", background: "#22c55e",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────

const EDITABLE_FIELDS = [
  "nombre_cliente", "email_cliente", "telefono_cliente",
  "estado_origen", "localidad_origen", "colonia_origen", "piso_origen",
  "elevador_origen", "acarreo_origen",
  "estado_destino", "localidad_destino", "colonia_destino", "piso_destino",
  "elevador_destino", "acarreo_destino",
  "empaque", "fecha_recoleccion", "tiempo_estimado", "modalidad",
  "seguro", "inventario", "articulos_delicados", "observaciones",
];

export default function LeadModal({ leadId, onClose, onLeadUpdated }) {
  const [lead, setLead]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchLead = useCallback(() => {
    setLoading(true);
    getLead(leadId)
      .then((data) => setLead(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [leadId]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  // Close on ESC
  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setLead((prev) => prev ? { ...prev, [name]: type === "checkbox" ? checked : value } : null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!lead) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload = {};
      EDITABLE_FIELDS.forEach((k) => { if (lead[k] !== undefined) payload[k] = lead[k]; });
      const updated = await updateLead(leadId, payload);
      if (updated) {
        setLead(updated);
        setSuccess("Lead updated successfully.");
        onLeadUpdated?.(updated);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function doPublish() {
    setShowConfirm(false);
    setPublishing(true);
    setError(null);
    try {
      const { lead: updated, url } = await publishLead(leadId);
      if (updated) {
        setLead({ ...updated, public_url: url || updated.public_url });
        setSuccess("Lead published! It is now visible on the Quotes page.");
        onLeadUpdated?.(updated, "published");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function handleToggleAdjudicada(val) {
    if (!val || !lead) return;
    setError(null);
    try {
      const updated = await adjudicarLead(leadId);
      if (updated) { setLead(updated); onLeadUpdated?.(updated); }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleToggleConcluida(val) {
    if (!val || !lead) return;
    setError(null);
    try {
      const updated = await concluirLead(leadId);
      if (updated) { setLead(updated); onLeadUpdated?.(updated); }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  const displayId = lead?.public_id || lead?.lead_id || lead?.id || leadId;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(460px, 100vw)",
          zIndex: 1001,
          background: "#fff",
          overflowY: "auto",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "#fff",
            padding: "16px 20px 12px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111827", margin: 0 }}>
            LEAD/{displayId}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", fontSize: 18,
              color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "16px 20px 32px" }}>
          {loading && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af" }}>
              Loading…
            </div>
          )}

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", color: "#16a34a", fontSize: 13, marginBottom: 14 }}>
              {success}
            </div>
          )}

          {lead && (
            <form onSubmit={handleSave}>
              {/* ── Customer ── */}
              <FieldBlock label="Customer Name">
                <Input name="nombre_cliente" value={lead.nombre_cliente} onChange={handleChange} required placeholder="Full name" />
              </FieldBlock>

              <FieldBlock label="Email">
                <Input name="email_cliente" type="email" value={lead.email_cliente} onChange={handleChange} required placeholder="email@example.com" />
              </FieldBlock>

              <FieldBlock label="Phone">
                <Input name="telefono_cliente" value={lead.telefono_cliente} onChange={handleChange} maxLength={10} placeholder="10 digits" />
              </FieldBlock>

              {/* ── Origin ── */}
              <SectionTitle>Origin</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FieldBlock label="State">
                  <Input name="estado_origen" value={lead.estado_origen} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="City">
                  <Input name="localidad_origen" value={lead.localidad_origen} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="Neighborhood">
                  <Input name="colonia_origen" value={lead.colonia_origen} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="Floor">
                  <Input name="piso_origen" value={lead.piso_origen} onChange={handleChange} placeholder="e.g. Ground" />
                </FieldBlock>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", cursor: "pointer" }}>
                  <input type="checkbox" name="elevador_origen" checked={!!lead.elevador_origen} onChange={handleChange} style={{ width: 16, height: 16, accentColor: "#22c55e" }} />
                  Elevator at origin
                </label>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, fontWeight: 500 }}>Haulage (m)</p>
                  <Input name="acarreo_origen" type="number" value={lead.acarreo_origen} onChange={handleChange} placeholder="30" style={{ maxWidth: 100 }} />
                </div>
              </div>

              {/* ── Destination ── */}
              <SectionTitle>Destination</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FieldBlock label="State">
                  <Input name="estado_destino" value={lead.estado_destino} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="City">
                  <Input name="localidad_destino" value={lead.localidad_destino} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="Neighborhood">
                  <Input name="colonia_destino" value={lead.colonia_destino} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="Floor">
                  <Input name="piso_destino" value={lead.piso_destino} onChange={handleChange} placeholder="e.g. Ground" />
                </FieldBlock>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", cursor: "pointer" }}>
                  <input type="checkbox" name="elevador_destino" checked={!!lead.elevador_destino} onChange={handleChange} style={{ width: 16, height: 16, accentColor: "#22c55e" }} />
                  Elevator at destination
                </label>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, fontWeight: 500 }}>Haulage (m)</p>
                  <Input name="acarreo_destino" type="number" value={lead.acarreo_destino} onChange={handleChange} placeholder="30" style={{ maxWidth: 100 }} />
                </div>
              </div>

              {/* ── Service details ── */}
              <SectionTitle>Service</SectionTitle>
              <FieldBlock label="Packing">
                <Input name="empaque" value={lead.empaque} onChange={handleChange} placeholder="Packing type" />
              </FieldBlock>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FieldBlock label="Collection Date">
                  <Input name="fecha_recoleccion" type="date" value={lead.fecha_recoleccion} onChange={handleChange} />
                </FieldBlock>
                <FieldBlock label="Est. Delivery Time">
                  <Input name="tiempo_estimado" value={lead.tiempo_estimado} onChange={handleChange} placeholder="3–6 days" />
                </FieldBlock>
              </div>

              <FieldBlock label="Modality">
                <Input name="modalidad" value={lead.modalidad} onChange={handleChange} placeholder="Service modality" />
              </FieldBlock>

              <FieldBlock label="Insurance Value ($)">
                <Input name="seguro" type="number" value={lead.seguro} onChange={handleChange} placeholder="0.00" />
              </FieldBlock>

              {/* ── Inventory & observations ── */}
              <SectionTitle>Inventory &amp; Notes</SectionTitle>
              <FieldBlock label="Inventory">
                <Textarea name="inventario" value={lead.inventario} onChange={handleChange} rows={4} placeholder="List of items…" />
              </FieldBlock>

              <FieldBlock label="Heavy / Delicate Items">
                <Input name="articulos_delicados" value={lead.articulos_delicados} onChange={handleChange} placeholder="e.g. Stone furniture" />
              </FieldBlock>

              <FieldBlock label="Observations">
                <Textarea name="observaciones" value={lead.observaciones} onChange={handleChange} rows={3} placeholder="Any special notes…" />
              </FieldBlock>

              {/* ── Public URL (when published) ── */}
              {lead.publicada && lead.public_url && (
                <>
                  <SectionTitle>Public Link</SectionTitle>
                  <div
                    style={{
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: 10, padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🔗</span>
                    <a
                      href={lead.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#16a34a", fontSize: 13, wordBreak: "break-all", fontFamily: "monospace" }}
                    >
                      {lead.public_url}
                    </a>
                  </div>
                </>
              )}

              {/* ── Save button ── */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: saving ? "#86efac" : "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: saving ? "not-allowed" : "pointer",
                  marginTop: 8,
                  marginBottom: 24,
                  transition: "background 0.2s",
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              {/* ── Toggle switches ── */}
              <div
                style={{
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* Publish */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#374151", margin: 0 }}>Publish</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                      {lead.publicada
                        ? "Published — visible on Quotes page"
                        : "Move this lead to the Quotes page"}
                    </p>
                  </div>
                  <Toggle
                    checked={!!lead.publicada}
                    disabled={!!lead.publicada || publishing}
                    onChange={(val) => { if (val) setShowConfirm(true); }}
                  />
                </div>

                {/* Mark as awarded */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#374151", margin: 0 }}>Mark as awarded</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                      {lead.adjudicada ? "Awarded" : "A supplier has been selected"}
                    </p>
                  </div>
                  <Toggle
                    checked={!!lead.adjudicada}
                    disabled={!!lead.adjudicada}
                    onChange={handleToggleAdjudicada}
                  />
                </div>

                {/* Mark as completed */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#374151", margin: 0 }}>Mark as completed</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                      {lead.concluida ? "Completed" : "Moving job finished"}
                    </p>
                  </div>
                  <Toggle
                    checked={!!lead.concluida}
                    disabled={!!lead.concluida}
                    onChange={handleToggleConcluida}
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Publish confirmation dialog */}
      {showConfirm && (
        <ConfirmDialog
          message="This lead will be moved to the Quotes page and a unique public link will be generated. This action cannot be undone."
          onConfirm={doPublish}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
