import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getLead, submitQuote } from "../../api/proveedorApi";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [precioTotal, setPrecioTotal] = useState("");
  const [notas, setNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCotizar(e) {
    e.preventDefault();
    const precio = parseFloat(precioTotal);
    if (isNaN(precio) || precio < 0) {
      setError("Precio total debe ser un número válido.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitQuote(id, { precio_total: precio, notas: notas.trim() || null });
      setPrecioTotal("");
      setNotas("");
      setLead((prev) => prev ? { ...prev, my_quotes_count: (prev.my_quotes_count ?? 0) + 1 } : null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al enviar cotización");
    } finally {
      setSubmitting(false);
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
        <Link to="/proveedor/dashboard" className="text-primary font-medium">← Volver a LEADS</Link>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Link to="/proveedor/dashboard" className="inline-block text-primary font-medium mb-4">← Volver a LEADS</Link>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Lead {lead.lead_id}</h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cliente</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Nombre</dt><dd className="font-medium">{lead.nombre_cliente}</dd>
            <dt className="text-gray-500">Email</dt><dd>{lead.email_cliente}</dd>
            <dt className="text-gray-500">Teléfono</dt><dd>{lead.telefono_cliente}</dd>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Origen</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Estado</dt><dd>{lead.estado_origen}</dd>
            <dt className="text-gray-500">Localidad</dt><dd>{lead.localidad_origen}</dd>
            <dt className="text-gray-500">Colonia</dt><dd>{lead.colonia_origen}</dd>
            <dt className="text-gray-500">Piso / niveles</dt><dd>{lead.piso_origen || "—"}</dd>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Destino</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Estado</dt><dd>{lead.estado_destino}</dd>
            <dt className="text-gray-500">Localidad</dt><dd>{lead.localidad_destino}</dd>
            <dt className="text-gray-500">Colonia</dt><dd>{lead.colonia_destino}</dd>
            <dt className="text-gray-500">Piso / niveles</dt><dd>{lead.piso_destino || "—"}</dd>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Detalles</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Fecha recolección</dt><dd>{formatDate(lead.fecha_recoleccion)}</dd>
            <dt className="text-gray-500">Empaque</dt><dd>{lead.empaque || "—"}</dd>
            <dt className="text-gray-500">Modalidad</dt><dd>{lead.modalidad || "—"}</dd>
            <dt className="text-gray-500">Inventario</dt><dd className="sm:col-span-2">{lead.inventario || "—"}</dd>
            {lead.observaciones && (
              <>
                <dt className="text-gray-500">Observaciones</dt>
                <dd className="sm:col-span-2">{lead.observaciones}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cotizar</h2>
          <form onSubmit={handleCotizar} className="space-y-4">
            <div>
              <label htmlFor="precio_total" className="block text-sm font-medium text-gray-700 mb-1">Precio Total *</label>
              <input
                id="precio_total"
                type="number"
                step="0.01"
                min="0"
                value={precioTotal}
                onChange={(e) => setPrecioTotal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Comentarios opcionales"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Ofrece tu mejor precio..."}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
