import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProviderLeads } from "../../api/providerApi";
import SimpleTable from "../../components/SimpleTable";
import { formatDate } from "../../utils/formatDate";

const columns = [
  { key: "created_at", label: "Fecha", render: (val) => formatDate(val) },
  { key: "public_id", label: "ID", render: (val, row) => val || row.id },
  { key: "client_name", label: "Cliente" },
  { key: "origin", label: "Origen", render: (_, row) => [row.origin_city, row.origin_state].filter(Boolean).join(", ") || "—" },
  { key: "destination", label: "Destino", render: (_, row) => [row.destination_city, row.destination_state].filter(Boolean).join(", ") || "—" },
  { key: "ideal_date", label: "Fecha ideal", render: (val) => formatDate(val) },
];

function ProviderLeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProviderLeads()
      .then((data) => { if (!cancelled) setLeads(data); })
      .catch((err) => { if (!cancelled) { setError(err.message); setLeads([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="mh-page">
        <p className="mh-loading">Cargando leads…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mh-page">
        <h1 className="mh-page-title">Leads para cotizar</h1>
        <div className="mh-alert mh-alert-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mh-page">
      <h1 className="mh-page-title">Leads para cotizar</h1>
      <p className="mh-page-subtitle">Leads publicados. Haz clic en una fila para ver detalle (próximamente).</p>

      <div className="mh-card">
        <SimpleTable
          columns={columns}
          data={leads}
          emptyMessage="No hay leads publicados."
          onRowClick={(row) => navigate(`/provider/leads/${row.id}`)}
        />
      </div>
    </div>
  );
}

export default ProviderLeadsList;
