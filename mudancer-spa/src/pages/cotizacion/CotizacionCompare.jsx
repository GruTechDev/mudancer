import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getLeadWithQuotes } from "../../api/cotizacionApi";
import SimpleTable from "../../components/SimpleTable";
import { formatDate } from "../../utils/formatDate";

const quoteColumns = [
  { key: "provider", label: "Proveedor", render: (_, row) => row.provider?.company_name || "—" },
  { key: "price", label: "Precio", render: (val) => val != null ? `$${Number(val).toLocaleString("es-MX")}` : "—" },
  { key: "modality", label: "Modalidad" },
  { key: "pickup_date", label: "Recojo", render: (val) => formatDate(val) },
  { key: "delivery_date", label: "Entrega", render: (val) => formatDate(val) },
  { key: "status", label: "Estado" },
];

function CotizacionCompare() {
  const { leadPublicId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!leadPublicId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeadWithQuotes(leadPublicId)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [leadPublicId]);

  if (loading) {
    return (
      <div className="mh-page">
        <p className="mh-loading">Cargando cotizaciones…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mh-page">
        <div className="mh-alert mh-alert-error">{error}</div>
        <Link to="/cotizacion" className="mh-back-link">← Otra solicitud</Link>
      </div>
    );
  }

  const lead = data?.lead;
  const quotes = data?.quotes ?? [];

  return (
    <div className="mh-page">
      <Link to="/cotizacion" className="mh-back-link">
        ← Otra solicitud
      </Link>
      <h1 className="mh-page-title">Cotizaciones</h1>
      <p className="mh-page-subtitle">
        Solicitud: {lead?.public_id || leadPublicId} — {lead?.client_name || "—"}
      </p>

      {lead && (
        <div className="mh-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="mh-card-title">Tu solicitud</h2>
          <p style={{ margin: 0 }}>
            Origen: {[lead.origin_city, lead.origin_state].filter(Boolean).join(", ") || "—"} → Destino: {[lead.destination_city, lead.destination_state].filter(Boolean).join(", ") || "—"}
            {lead.ideal_date && ` · Fecha ideal: ${formatDate(lead.ideal_date)}`}
          </p>
        </div>
      )}

      <div className="mh-card">
        <h2 className="mh-card-title">Comparar cotizaciones</h2>
        <SimpleTable
          columns={quoteColumns}
          data={quotes}
          emptyMessage="Aún no hay cotizaciones para esta solicitud."
        />
      </div>
    </div>
  );
}

export default CotizacionCompare;
