import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "../../api/proveedorApi";

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

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
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

  const filtered = search.trim()
    ? leads.filter(
        (l) =>
          (l.lead_id && l.lead_id.toLowerCase().includes(search.toLowerCase())) ||
          (l.nombre_cliente && l.nombre_cliente.toLowerCase().includes(search.toLowerCase())) ||
          (l.estado_origen && l.estado_origen.toLowerCase().includes(search.toLowerCase())) ||
          (l.estado_destino && l.estado_destino.toLowerCase().includes(search.toLowerCase()))
      )
    : leads;

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
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">LEADS</h1>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Buscar por ID, cliente, origen, destino…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Origen → Destino</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {search.trim() ? "Sin resultados." : "No hay leads disponibles."}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate("/proveedor/leads/" + lead.id)}
                    className="border-b border-gray-100 hover:bg-primary-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-medium text-primary">{lead.lead_id}</td>
                    <td className="px-4 py-3 text-gray-900">{lead.nombre_cliente}</td>
                    <td className="px-4 py-3 text-gray-600">{formatOriginDestino(lead)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(lead.fecha_recoleccion)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Disponible
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
