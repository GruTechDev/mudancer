# Reusing shared components and API helpers

## Visual style (same as Admin)

All sections (Admin, Provider, Cotización) use the same CSS: **`src/styles/admin.css`**. Class names follow the `mh-*` (Mudancer / moving-helper) convention:

- **Page:** `mh-page`, `mh-page-title`, `mh-page-subtitle`
- **Cards:** `mh-card`, `mh-card-title`
- **Tables:** `mh-table-wrap`, `mh-table`, `mh-table-empty`, `mh-table-row-new`
- **Forms:** `mh-form`, `mh-form-group`, `mh-form-label`, `mh-form-input`, `mh-form-actions`
- **Buttons:** `mh-button`, `mh-button-primary`, `mh-button-secondary`, `mh-button-success`
- **Alerts:** `mh-alert`, `mh-alert-error`, `mh-alert-info`
- **Login-style:** `mh-login-wrap`, `mh-login-card`, `mh-login-title`, `mh-login-subtitle`
- **Misc:** `mh-loading`, `mh-back-link`, `mh-badge`, `mh-badge-new`, `mh-badge-published`

Import the styles once in **`App.jsx`** (`import "./styles/admin.css"`). No need to import again in child routes.

---

## Shared components

### `src/components/SimpleTable.jsx`

Reusable table with the same look as the Admin leads table (simplified API).

- **Props:** `columns` (array of `{ key, label, render? }`), `data` (array of objects), `emptyMessage`, `rowClassName(row)`, `onRowClick(row)`, optional `children` (custom tbody).
- **Used in:** Admin (can be refactored), Provider leads list, Provider orders list, Cotización compare.
- **Example:**

```jsx
import SimpleTable from "../../components/SimpleTable";

<SimpleTable
  columns={[
    { key: "public_id", label: "ID" },
    { key: "client_name", label: "Cliente" },
    { key: "created_at", label: "Fecha", render: (val) => formatDate(val) },
  ]}
  data={leads}
  emptyMessage="No hay datos."
  onRowClick={(row) => navigate(`/path/${row.id}`)}
/>
```

---

## Shared utils

### `src/utils/formatDate.js`

- **Export:** `formatDate(str)` — returns `"dd/mm/yyyy"` (es-MX) or `"—"` if invalid/missing.
- **Use in:** Any page that shows dates (admin, provider, cotización).

```js
import { formatDate } from "../../utils/formatDate";
```

---

## API helpers (where to import)

| Area      | File                  | Functions                                                                 | Used in |
|----------|------------------------|---------------------------------------------------------------------------|---------|
| Admin    | `src/api/adminLeads.js`    | `getLeads`, `getLead`, `updateLead`, `publishLead`                         | AdminLeadsList, AdminLeadDetail |
| Admin    | `src/api/adminProviders.js` | `getProviders`, `getProvider`, `createProvider`, `updateProvider`         | AdminProvidersList, AdminProviderCreate, AdminProviderEdit |
| Provider | `src/api/providerApi.js`   | `getProviderLeads`, `createQuote`, `getProviderOrders`                    | ProviderLeadsList, ProviderOrdersList (and future quote form) |
| Client   | `src/api/cotizacionApi.js` | `getLeadWithQuotes(publicId)` → `{ lead, quotes }`                        | CotizacionCompare |

All API modules use the same base URL: **`import.meta.env.VITE_API_URL`** or `http://127.0.0.1:8000/api`. Set `VITE_API_URL` in `.env` for production.

---

## Routes overview

| Path | Layout        | Page / purpose |
|------|---------------|-----------------|
| `/admin/*` | AdminLayout   | Login, providers CRUD, leads list/detail |
| `/provider/leads` | ProviderLayout | List published leads (table) |
| `/provider/leads/:id` | ProviderLayout | Lead detail (placeholder for quote form) |
| `/provider/orders` | ProviderLayout | Assigned orders (table) |
| `/cotizacion` | (none)        | Client login: phone or lead ID |
| `/cotizacion/:leadPublicId` | (none) | Quote comparison for that lead |
