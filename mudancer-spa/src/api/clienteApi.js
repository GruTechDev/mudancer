/**
 * Cliente API — no auth. Phone lookup and select quote.
 * Base URL: VITE_API_URL (production VPS) or /api.
 */
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").trim()
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, "")}/api`
  : "/api";

export const clienteApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** POST /api/cliente/login — body: { telefono } (10 digits). Returns { lead, quotes }. */
export async function verCotizaciones(telefono) {
  const { data } = await clienteApi.post("/cliente/login", { telefono });
  return data;
}

/** PUT /api/cliente/quotes/{id}/seleccionar */
export async function seleccionarQuote(quoteId) {
  const { data } = await clienteApi.put(`/cliente/quotes/${quoteId}/seleccionar`);
  return data;
}
