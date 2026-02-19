import { Outlet, Link, useLocation } from "react-router-dom";

function ProviderLayout() {
  const location = useLocation();

  return (
    <div className="mh-app">
      <header className="mh-header">
        <div className="mh-header-inner">
          <Link to="/provider/leads" className="mh-header-brand">
            Mudancer Proveedor
          </Link>
          <nav className="mh-header-nav">
            <Link
              to="/provider/leads"
              className={"mh-header-link" + (location.pathname.startsWith("/provider/leads") ? " mh-header-link-active" : "")}
            >
              Leads
            </Link>
            <Link
              to="/provider/orders"
              className={"mh-header-link" + (location.pathname.startsWith("/provider/orders") ? " mh-header-link-active" : "")}
            >
              Órdenes
            </Link>
          </nav>
        </div>
      </header>

      <main className="mh-main">
        <Outlet />
      </main>

      <footer className="mh-footer">
        <div className="mh-footer-inner">
          Panel de proveedor — Cotizaciones y órdenes
        </div>
      </footer>
    </div>
  );
}

export default ProviderLayout;
