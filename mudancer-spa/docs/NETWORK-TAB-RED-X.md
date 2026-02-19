# About the red X on the "html" request in the Network tab

If you see a failed request named **`html`** with status **`(blocked:other)`** in Chrome DevTools:

- **Request URL:** `https://safeframe.googlesyndication.com/safeframe/1-0-40/html`
- **Initiator:** `content.js:1`

That request is **not** from your app or your Laravel API. It is:

1. **Google’s safeframe** (ads/syndication).
2. Triggered by a **browser extension** (e.g. ad-related or page-injecting). `content.js` is typically an extension content script.

So:

- **Your API is fine** if your own requests (e.g. `providers`, `leads` to `http://144.217.162.167/api/...`) show **200**.
- The red X on that `html` request is the browser (or an extension) blocking that third-party URL. You can ignore it for your app.
- To get a “clean” Network tab during development, use an incognito window with extensions disabled, or disable extensions that inject scripts.

**“No hay proveedores”** when the API returns 200 usually means the database has no providers yet. Use “Nuevo proveedor” to add one.
