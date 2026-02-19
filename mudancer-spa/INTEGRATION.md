# Mudancer Admin — Integration Instructions

This document explains how the new Moving-Help–style admin UI is wired and how to keep or replace your setup.

---

## 1. What Was Created or Updated

### New files

| File | Purpose |
|------|--------|
| `src/styles/admin.css` | All admin styles: layout, theme (mh-*), tables, forms, buttons, responsive breakpoints, animations. |
| `src/pages/admin/AdminProvidersList.jsx` | Providers list page (replaces `ProvidersList.jsx` in the router). |
| `src/pages/admin/AdminProviderCreate.jsx` | New provider form (replaces `ProviderNew.jsx`). |
| `src/pages/admin/AdminProviderEdit.jsx` | Edit provider form (replaces `ProviderEdit.jsx`). |
| `src/pages/admin/AdminLeadsList.jsx` | Leads list page (replaces `LeadsList.jsx`). |
| `src/pages/admin/AdminLeadDetail.jsx` | Lead detail/edit page (replaces `LeadDetail.jsx`). |

### Updated files

| File | Change |
|------|--------|
| `src/layouts/AdminLayout.jsx` | Uses `mh-app`, `mh-header`, `mh-main`, `mh-footer`; same auth logic. |
| `src/pages/admin/AdminLogin.jsx` | New layout with `mh-login-wrap`, `mh-login-card`, `mh-form`, `mh-button-primary`. |
| `src/App.jsx` | Imports the new page components and `./styles/admin.css` instead of `./App.css`. Route paths are unchanged. |

### Unchanged

- `src/main.jsx` — No change. Still loads `index.css` and `App.jsx`.
- `src/components/RequireAdmin.jsx` — No change.
- Route paths: `/admin/login`, `/admin/providers`, `/admin/providers/new`, `/admin/providers/:id`, `/admin/leads`, `/admin/leads/:id`.

---

## 2. Step-by-Step Integration

### Step 1: Use the new layout

- **File:** `src/layouts/AdminLayout.jsx`
- It already wraps all admin content with the new header, main area, and footer. No extra step if you use the file as provided.

### Step 2: Use the new page components and CSS

- **File:** `src/App.jsx`
- It should:
  - Import the new components: `AdminProvidersList`, `AdminProviderCreate`, `AdminProviderEdit`, `AdminLeadsList`, `AdminLeadDetail`.
  - Import the admin styles: `import "./styles/admin.css";`
- Routes stay the same; only the `element` components were switched to the new names.

### Step 3: Load the admin CSS

- **Option A (current):** In `src/App.jsx`, use:
  ```js
  import "./styles/admin.css";
  ```
  So the admin styles apply whenever the app (and thus `App.jsx`) is loaded.

- **Option B:** In `src/main.jsx`, add:
  ```js
  import "./styles/admin.css";
  ```
  So the admin CSS is global and loads with the app. Either Option A or B is enough; we use A.

### Step 4: Remove old admin pages (optional)

If you no longer need the previous admin pages, you can delete:

- `src/pages/admin/ProvidersList.jsx`
- `src/pages/admin/ProviderNew.jsx`
- `src/pages/admin/ProviderEdit.jsx`
- `src/pages/admin/LeadsList.jsx`
- `src/pages/admin/LeadDetail.jsx`

Do **not** delete `AdminLogin.jsx`; it was updated in place.

### Step 5: Optional cleanup of old CSS

- If you had admin-only styles in `src/App.css`, you can remove them; they are replaced by `src/styles/admin.css`.
- You can keep `App.css` for any non-admin styles, or leave it empty. `App.jsx` no longer imports `App.css`; it only imports `./styles/admin.css`.

---

## 3. Router Configuration (no change)

Your React Router setup stays the same:

- **Routes:** Defined in `src/App.jsx`.
- **Paths:** `/admin` → `AdminLayout`; children: `login`, `providers`, `providers/new`, `providers/:id`, `leads`, `leads/:id`.
- **Protection:** `RequireAdmin` wraps the protected routes; login is outside it.

Nothing in `main.jsx` or the router needs to change for this redesign.

---

## 4. Class Name Pattern (mh-*)

All admin UI uses a single pattern so class names are clear and avoid clashes:

- **Layout:** `mh-app`, `mh-header`, `mh-header-inner`, `mh-main`, `mh-footer`, `mh-footer-inner`
- **Page:** `mh-page`, `mh-page-title`, `mh-page-subtitle`
- **Cards:** `mh-card`, `mh-card-title`, `mh-card-body`
- **Tables:** `mh-table-wrap`, `mh-table`, `mh-table-row-new`, `mh-table-empty`, `mh-badge`, `mh-badge-new`, `mh-badge-published`, `mh-badge-default`
- **Forms:** `mh-form`, `mh-form-group`, `mh-form-label`, `mh-form-input`, `mh-form-textarea`, `mh-form-section`, `mh-form-section-title`, `mh-form-actions`
- **Buttons:** `mh-button`, `mh-button-primary`, `mh-button-secondary`, `mh-button-success`, `mh-button-link`
- **Login:** `mh-login-wrap`, `mh-login-card`, `mh-login-title`, `mh-login-subtitle`
- **Feedback:** `mh-alert`, `mh-alert-error`, `mh-loading`, `mh-back-link`

Use these in JSX where the design applies; the CSS is in `src/styles/admin.css`.

---

## 5. Animations (CSS only)

- **Page entrance:** The class `mh-page` uses a short fade + slight upward motion (`mh-page-in` keyframes in `admin.css`). Add `className="mh-page"` to the root div of each admin page.
- **Cards:** `.mh-card` has a subtle hover (shadow + optional transform). No extra class in JSX.
- **Tables:** Rows use `mh-table-row-new` for new leads; all rows have a light hover background.
- **Buttons:** `.mh-button-primary` and `.mh-button-success` get a small lift and shadow on hover.

All of this is in `src/styles/admin.css`; no JS or extra libraries.

---

## 6. Responsive Breakpoints

Defined in `src/styles/admin.css`:

- **≥ 1024px:** Desktop (default).
- **768px – 1023px:** Tablet; slightly reduced padding and font sizes.
- **< 768px:** Mobile; stacked layout, full-width buttons, tables scroll horizontally.
- **≤ 480px:** Small mobile; tighter padding and font sizes.

No changes are required in JSX for responsiveness; it’s all in the CSS.
