import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "../../api/adminApi";

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatOriginDestino(lead) {
  const o = [lead.origin_city, lead.origin_state].filter(Boolean).join(", ") || "—";
  const d = [lead.destination_city, lead.destination_state].filter(Boolean).join(", ") || "—";
  return `${o} → ${d}`;
}

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLeads()
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
        <p className="text-gray-500">Cargando leads…</p>
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
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Leads</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Origen → Destino</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Fecha recolección</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay leads.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    className={`border-b border-gray-100 hover:bg-primary-50 cursor-pointer transition ${lead.is_new ? "bg-yellow-100 border-l-4 border-l-yellow-400" : ""}`}
                  >
                    <td className="px-4 py-3 text-gray-600">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-primary">{lead.public_id || lead.id}</td>
                    <td className="px-4 py-3 text-gray-900">{lead.client_name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatOriginDestino(lead)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(lead.ideal_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === "published" ? "bg-green-100 text-green-800" :
                        lead.status === "adjudicated" ? "bg-blue-100 text-blue-800" :
                        lead.status === "concluded" ? "bg-gray-100 text-gray-800" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {lead.status || "draft"}
                      </span>
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
