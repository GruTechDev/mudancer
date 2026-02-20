import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCotizadas } from "../../api/adminApi";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatOriginDestino(lead) {
  const o = [lead.localidad_origen, lead.estado_origen].filter(Boolean).join(", ") || "—";
  const d = [lead.localidad_destino, lead.estado_destino].filter(Boolean).join(", ") || "—";
  return `${o} → ${d}`;
}

function statusLabel(lead) {
  if (lead.concluida) return "Concluida";
  if (lead.adjudicada) return "Adjudicada";
  if (lead.publicada) return "Publicada";
  return "Borrador";
}

export default function Cotizadas() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCotizadas()
      .then((list) => {
        if (!cancelled) setLeads(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[40vh]">
        <p className="text-gray-500">Cargando cotizadas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Cotizadas</h1>
      <p className="text-sm text-gray-600 mb-4">Leads con cotizaciones. Haz clic en un lead para ver y asignar.</p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Origen → Destino</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Cotizaciones</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay leads cotizados.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const hasNewQuotes = (lead.new_quotes ?? 0) > 0;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/admin/cotizadas/${lead.id}`)}
                      className={`border-b border-gray-100 hover:bg-primary-50 cursor-pointer transition ${hasNewQuotes ? "bg-yellow-100 border-l-4 border-l-yellow-400" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-600">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-primary">{lead.lead_id || lead.id}</td>
                      <td className="px-4 py-3 text-gray-900">{lead.nombre_cliente}</td>
                      <td className="px-4 py-3 text-gray-600">{formatOriginDestino(lead)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead.quotes?.length ?? 0}
                        {hasNewQuotes && (
                          <span className="ml-1 inline-block px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-900 text-xs font-medium">
                            nuevas
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.concluida ? "bg-gray-100 text-gray-800" :
                          lead.adjudicada ? "bg-blue-100 text-blue-800" :
                          lead.publicada ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {statusLabel(lead)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
