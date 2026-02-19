/**
 * Provider-side API — /api/provider/leads, /api/provider/orders, POST quote.
 * Same base URL as admin (VITE_API_URL). For now no auth; backend uses user_id=1.
 */

const BASE = (import.meta.env.VITE_API_URL ?? "").trim();

async function request(path, options = {}) {
  const base = BASE ? BASE.replace(/\/$/, "") : "";
  const url = path.startsWith("http") ? path : base ? `${base}${path}` : `/api${path}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };
  if (options.body != null && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      console.error("[providerApi] parse error", e);
    }
  }
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

/** GET /api/provider/leads — published leads for quoting */
export async function getProviderLeads() {
  const data = await request("/provider/leads");
  return Array.isArray(data) ? data : [];
}

/** POST /api/provider/leads/{id}/quotes — create quote */
export async function createQuote(leadId, data) {
  return request(`/provider/leads/${leadId}/quotes`, { method: "POST", body: data });
}

/** GET /api/provider/orders — assigned orders */
export async function getProviderOrders() {
  const data = await request("/provider/orders");
  return Array.isArray(data) ? data : [];
}
