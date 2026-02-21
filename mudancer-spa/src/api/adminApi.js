/**
 * Admin API using axios client (sends Bearer token from localStorage).
 */

import api from "./client";

export async function login(identifier, password) {
  const { data } = await api.post("/admin/login", { identifier, password });
  return data;
}

export async function getLeads() {
  const { data } = await api.get("/admin/leads");
  const list = data?.data;
  return Array.isArray(list) ? list : [];
}

export async function getLead(id) {
  const { data } = await api.get(`/admin/leads/${id}`);
  return data?.data ?? null;
}

export async function updateLead(id, body) {
  const { data } = await api.put(`/admin/leads/${id}`, body);
  return data?.data ?? null;
}

export async function publishLead(id) {
  const { data } = await api.post(`/admin/leads/${id}/publish`);
  return { lead: data?.data, url: data?.url };
}

export async function adjudicarLead(id) {
  const { data } = await api.post(`/admin/leads/${id}/adjudicar`);
  return data?.data ?? null;
}

export async function concluirLead(id) {
  const { data } = await api.post(`/admin/leads/${id}/concluir`);
  return data?.data ?? null;
}

export async function getProviders({ page = 1, search = "", searchBy = "nombre", perPage = 10 } = {}) {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (search.trim()) {
    params.append("search", search.trim());
    params.append("search_by", searchBy);
  }
  const { data } = await api.get(`/admin/providers?${params}`);
  return data; // Laravel paginated: { data: [], current_page, last_page, total, ... }
}

export async function createProvider(body) {
  const { data } = await api.post("/admin/providers", body);
  return data;
}

export async function updateProvider(id, body) {
  const { data } = await api.put(`/admin/providers/${id}`, body);
  return data;
}

/** GET /api/admin/cotizadas — leads with quotes (!concluida), new_quotes count. */
export async function getCotizadas() {
  const { data } = await api.get("/admin/cotizadas");
  const list = data?.data;
  return Array.isArray(list) ? list : [];
}

/** POST /api/admin/quotes/{quote}/asignar — set quote selected, lead adjudicated; returns quote with pdf_links. */
export async function assignQuote(quoteId) {
  const { data } = await api.post(`/admin/quotes/${quoteId}/asignar`);
  return data?.data ?? null;
}
