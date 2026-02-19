/**
 * Public cotización API — lead + quotes by public_id (no auth).
 * GET /api/cotizacion/leads/:publicId
 */

const BASE = (import.meta.env.VITE_API_URL ?? "").trim();

async function request(path) {
  const base = BASE ? BASE.replace(/\/$/, "") : "";
  const url = path.startsWith("http") ? path : base ? `${base}${path}` : `/api${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      console.error("[cotizacionApi] parse error", e);
    }
  }
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

/** GET /api/cotizacion/leads/:publicId — returns { lead, quotes } */
export async function getLeadWithQuotes(publicId) {
  return request(`/cotizacion/leads/${encodeURIComponent(publicId)}`);
}
