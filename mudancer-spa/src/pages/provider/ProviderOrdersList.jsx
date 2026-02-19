import { useState, useEffect } from "react";
import { getProviderOrders } from "../../api/providerApi";
import SimpleTable from "../../components/SimpleTable";
import { formatDate } from "../../utils/formatDate";

const columns = [
  { key: "id", label: "Orden" },
  { key: "status", label: "Estado" },
  { key: "lead", label: "Lead", render: (_, row) => row.lead?.public_id || row.lead_id || "—" },
  { key: "created_at", label: "Fecha", render: (val) => formatDate(val) },
];

function ProviderOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProviderOrders()
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch((err) => { if (!cancelled) { setError(err.message); setOrders([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="mh-page">
        <p className="mh-loading">Cargando órdenes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mh-page">
        <h1 className="mh-page-title">Órdenes de servicio</h1>
        <div className="mh-alert mh-alert-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mh-page">
      <h1 className="mh-page-title">Órdenes de servicio</h1>
      <p className="mh-page-subtitle">Órdenes asignadas a tu cuenta.</p>

      <div className="mh-card">
        <SimpleTable
          columns={columns}
          data={orders}
          emptyMessage="No hay órdenes asignadas."
        />
      </div>
    </div>
  );
}

export default ProviderOrdersList;
