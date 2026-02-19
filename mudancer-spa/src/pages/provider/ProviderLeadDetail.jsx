import { Link } from "react-router-dom";

function ProviderLeadDetail() {
  return (
    <div className="mh-page">
      <Link to="/provider/leads" className="mh-back-link">
        ← Volver a leads
      </Link>
      <h1 className="mh-page-title">Detalle del lead</h1>
      <p className="mh-page-subtitle">Formulario de cotización próximamente.</p>
    </div>
  );
}

export default ProviderLeadDetail;
