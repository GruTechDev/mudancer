import { useState, useEffect } from "react";
import { getOrdenes, concludeOrder } from "../../api/proveedorApi";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concludingId, setConcludingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrdenes()
      .then((list) => {
        if (!cancelled) setOrdenes(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleConcluir(quoteId) {
    setError(null);
    setConcludingId(quoteId);
    try {
      await concludeOrder(quoteId);
      setOrdenes((prev) => prev.filter((q) => q.id !== quoteId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setConcludingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[40vh]">
        <p className="text-gray-500">Cargando órdenes…</p>
      </div>
    );
  }

  if (error && ordenes.length === 0) {
    return (
      <div className="p-4">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">ORDENES</h1>
      <p className="text-primary font-semibold mb-6">¡Felicidades, tu oferta fue aceptada!</p>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
      )}

      {ordenes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No tienes órdenes adjudicadas aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-700">Lead</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Precio</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((quote) => (
                  <tr key={quote.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-primary">
                      {quote.lead?.lead_id ?? quote.lead_id ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {quote.lead?.nombre_cliente ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      ${Number(quote.precio_total).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Adjudicada
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="#"
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Cotización PDF
                        </a>
                        <a
                          href="#"
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          ODS PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => handleConcluir(quote.id)}
                          disabled={concludingId === quote.id}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          {concludingId === quote.id ? "…" : "Concluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
