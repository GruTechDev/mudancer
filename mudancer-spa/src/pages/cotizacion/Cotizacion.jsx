import { useState } from "react";
import { verCotizaciones, seleccionarQuote } from "../../api/clienteApi";

const PHONE_LENGTH = 10;
const PHONE_REGEX = /^[0-9]+$/;

export default function Cotizacion() {
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { lead, quotes }
  const [selectingId, setSelectingId] = useState(null);

  function handleVerCotizaciones(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const raw = telefono.replace(/\D/g, "");
    const err = raw.length !== PHONE_LENGTH ? "El teléfono debe tener 10 dígitos." : !PHONE_REGEX.test(raw) ? "Solo números." : null;
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    verCotizaciones(raw)
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((err) => {
        const msg = err.response?.status === 404
          ? "No hay cotizaciones aún. Regresa más tarde."
          : err.response?.data?.message || err.message || "Error al cargar.";
        setError(msg);
        setResult(null);
      })
      .finally(() => setLoading(false));
  }

  function handleSeleccionar(quote) {
    if (quote.seleccionada) return;
    setSelectingId(quote.id);
    seleccionarQuote(quote.id)
      .then(() => {
        setResult((prev) => ({
          ...prev,
          quotes: prev.quotes.map((q) => (q.id === quote.id ? { ...q, seleccionada: true } : q)),
        }));
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Error al seleccionar.");
      })
      .finally(() => setSelectingId(null));
  }

  const rawPhone = telefono.replace(/\D/g, "");
  const phoneValid = rawPhone.length === PHONE_LENGTH && PHONE_REGEX.test(rawPhone);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased p-4 sm:p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Mis cotizaciones
        </h1>

        <form onSubmit={handleVerCotizaciones} className="space-y-3 mb-8">
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono (10 dígitos)
          </label>
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="5512345678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            autoComplete="tel"
          />
          {error && !result && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !phoneValid}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Buscando…" : "Ver mis cotizaciones"}
          </button>
        </form>

        {result && (
          <section className="space-y-4">
            {result.quotes.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No hay cotizaciones aún. Regresa más tarde.
              </p>
            ) : (
              <ul className="space-y-3">
                {result.quotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                      <span className="font-medium text-gray-900">
                        {quote.provider?.nombre ?? "Proveedor"}
                      </span>
                      <span className="text-lg font-semibold text-blue-600">
                        ${Number(quote.precio_total ?? 0).toLocaleString("es-MX")}
                      </span>
                      <span className="inline-flex items-center text-amber-600" title="Reputación">
                        {"⭐".repeat(Math.min(5, Math.max(0, Number(quote.provider?.reputacion ?? 0))))}
                        <span className="ml-1 text-sm text-gray-500">
                          ({quote.provider?.reputacion ?? 0})
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSeleccionar(quote)}
                        disabled={quote.seleccionada || selectingId !== null}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {quote.seleccionada
                          ? "Seleccionada"
                          : selectingId === quote.id
                          ? "Guardando…"
                          : "Seleccionar"}
                      </button>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Descargar PDF
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
