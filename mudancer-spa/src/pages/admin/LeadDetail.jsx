import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getLead,
  updateLead,
  publishLead,
  adjudicarLead,
  concluirLead,
} from "../../api/adminApi";

const EDITABLE_KEYS = [
  "nombre_cliente", "email_cliente", "telefono_cliente",
  "estado_origen", "localidad_origen", "colonia_origen", "piso_origen",
  "elevador_origen", "acarreo_origen",
  "estado_destino", "localidad_destino", "colonia_destino", "piso_destino",
  "elevador_destino", "acarreo_destino",
  "empaque", "fecha_recoleccion", "tiempo_estimado", "modalidad", "seguro",
  "inventario", "articulos_delicados", "observaciones",
  "publicada", "adjudicada", "concluida", "vista",
];

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [publishedUrl, setPublishedUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLead(id)
      .then((data) => {
        if (!cancelled) setLead(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    let v = value;
    if (type === "number") v = value === "" ? "" : Number(value);
    if (type === "checkbox") v = e.target.checked;
    setLead((prev) => (prev ? { ...prev, [name]: v } : null));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!lead) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {};
      EDITABLE_KEYS.forEach((key) => {
        if (lead[key] !== undefined) payload[key] = lead[key];
      });
      const data = await updateLead(id, payload);
      if (data) setLead(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!lead) return;
    setError(null);
    try {
      const { lead: updated, url } = await publishLead(id);
      if (updated) setLead(updated);
      if (url) setPublishedUrl(url);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleAdjudicar() {
    if (!lead) return;
    setError(null);
    try {
      const data = await adjudicarLead(id);
      if (data) setLead(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleConcluir() {
    if (!lead) return;
    setError(null);
    try {
      const data = await concluirLead(id);
      if (data) setLead(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[40vh]">
        <p className="text-gray-500">Cargando…</p>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="p-4">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-4">{error}</div>
        <Link to="/admin/dashboard" className="text-primary font-medium">← Volver al dashboard</Link>
      </div>
    );
  }

  if (!lead) return null;

  const displayId = lead.public_id || lead.lead_id || lead.id;
  const showUrl = publishedUrl || (lead.publicada && lead.lead_id ? `/leads/${lead.lead_id}` : null);

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <Link to="/admin/dashboard" className="inline-block text-primary font-medium mb-4">← Volver al dashboard</Link>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Lead {displayId}</h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Toggles */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePublish}
          disabled={lead.publicada}
          className="px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {lead.publicada ? "Publicado" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={handleAdjudicar}
          disabled={lead.adjudicada}
          className="px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {lead.adjudicada ? "Adjudicado" : "Adjudicar"}
        </button>
        <button
          type="button"
          onClick={handleConcluir}
          disabled={lead.concluida}
          className="px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {lead.concluida ? "Concluida" : "Concluida"}
        </button>
      </div>

      {showUrl && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">URL pública</p>
          <p className="text-primary font-mono text-sm break-all">{showUrl}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cliente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre cliente *</label>
              <input name="nombre_cliente" value={lead.nombre_cliente ?? ""} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input name="email_cliente" type="email" value={lead.email_cliente ?? ""} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (10 dígitos) *</label>
              <input name="telefono_cliente" value={lead.telefono_cliente ?? ""} onChange={handleChange} maxLength={10} pattern="[0-9]{10}" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Origen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><input name="estado_origen" value={lead.estado_origen ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label><input name="localidad_origen" value={lead.localidad_origen ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Colonia</label><input name="colonia_origen" value={lead.colonia_origen ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Piso</label><input name="piso_origen" value={lead.piso_origen ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="flex items-center gap-2"><input name="elevador_origen" type="checkbox" checked={!!lead.elevador_origen} onChange={handleChange} className="rounded text-primary focus:ring-primary" /> Elevador origen</label></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Acarreo origen</label><input name="acarreo_origen" type="number" min={0} value={lead.acarreo_origen ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Destino</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><input name="estado_destino" value={lead.estado_destino ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label><input name="localidad_destino" value={lead.localidad_destino ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Colonia</label><input name="colonia_destino" value={lead.colonia_destino ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Piso</label><input name="piso_destino" value={lead.piso_destino ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="flex items-center gap-2"><input name="elevador_destino" type="checkbox" checked={!!lead.elevador_destino} onChange={handleChange} className="rounded text-primary focus:ring-primary" /> Elevador destino</label></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Acarreo destino</label><input name="acarreo_destino" type="number" min={0} value={lead.acarreo_destino ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Detalles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Empaque</label><input name="empaque" value={lead.empaque ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha recolección</label><input name="fecha_recoleccion" type="date" value={lead.fecha_recoleccion ? String(lead.fecha_recoleccion).slice(0, 10) : ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tiempo estimado</label><input name="tiempo_estimado" value={lead.tiempo_estimado ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label><input name="modalidad" value={lead.modalidad ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Seguro</label><input name="seguro" type="number" step="0.01" min={0} value={lead.seguro ?? ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Inventario</label>
            <textarea name="inventario" value={lead.inventario ?? ""} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Artículos delicados</label>
            <textarea name="articulos_delicados" value={lead.articulos_delicados ?? ""} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea name="observaciones" value={lead.observaciones ?? ""} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
