import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CotizacionLogin() {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const value = input.trim();
    if (!value) {
      setError("Ingresa tu teléfono o el ID de tu solicitud.");
      return;
    }
    // If it looks like a public_id (UUID or short id), go to comparison; otherwise treat as phone (for now same: use as publicId for demo, or later lookup by phone).
    navigate(`/cotizacion/${encodeURIComponent(value)}`, { replace: true });
  }

  return (
    <div className="mh-page">
      <div className="mh-login-wrap">
        <div className="mh-login-card mh-card">
          <h1 className="mh-login-title">Ver mis cotizaciones</h1>
          <p className="mh-login-subtitle">
            Ingresa el ID de tu solicitud (o teléfono) para ver y comparar cotizaciones.
          </p>
          <form className="mh-form" onSubmit={handleSubmit}>
            {error && <div className="mh-alert mh-alert-error">{error}</div>}
            <div className="mh-form-group">
              <label className="mh-form-label" htmlFor="cotizacion-input">
                ID de solicitud o teléfono
              </label>
              <input
                id="cotizacion-input"
                type="text"
                className="mh-form-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej: abc-123 o 5512345678"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="mh-button mh-button-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              Ver cotizaciones
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CotizacionLogin;
