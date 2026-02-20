import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLead, assignQuote } from "../../api/adminApi";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function CotizadasDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

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

  function handleAsignar(quote) {
    if (quote.seleccionada) return;
    setAssigningId(quote.id);
    assignQuote(quote.id)
      .then((updated) => {
        if (!updated || !lead) return;
        setLead({
          ...lead,
          quotes: lead.quotes.map((q) =>
            q.id === quote.id
              ? { ...q, seleccionada: true, pdf_links: updated.pdf_links ?? [] }
              : q
          ),
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Error al asignar.");
      })
      .finally(() => setAssigningId(null));
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
        <Link to="/admin/cotizadas" className="text-primary hover:underline">← Volver a Cotizadas</Link>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  const quotes = lead.quotes ?? [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <Link to="/admin/cotizadas" className="text-primary hover:underline text-sm">← Cotizadas</Link>
      </div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        Lead: {lead.nombre_cliente} ({lead.lead_id || lead.id})
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Fecha ideal: {formatDate(lead.fecha_recoleccion)} · {lead.estado_origen} → {lead.estado_destino}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-800">
          Cotizaciones
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700">Proveedor</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Precio</th>
                <th className="px-4 py-3 font-semibold text-gray-700">✓ Seleccionada</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No hay cotizaciones.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className={`border-b border-gray-100 ${quote.vista === false ? "bg-yellow-100 border-l-4 border-l-yellow-400" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {quote.provider?.nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ${Number(quote.precio_total ?? 0).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-3">
                      {quote.seleccionada ? (
                        <span className="text-green-600 font-medium">✓ Seleccionada</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAsignar(quote)}
                          disabled={quote.seleccionada || assigningId !== null}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {quote.seleccionada ? "Asignada" : assigningId === quote.id ? "Asignando…" : "Asignar"}
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                          title="Próximamente"
                        >
                          Generar PDFs
                        </button>
                      </div>
                      {(quote.pdf_links && quote.pdf_links.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {quote.pdf_links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url || link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {link.label || `PDF ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
