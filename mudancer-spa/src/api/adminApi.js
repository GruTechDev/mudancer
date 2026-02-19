/**
 * Admin API using axios client (sends Bearer token from localStorage).
 */

import api from "./client";

export async function login(email, password) {
  const { data } = await api.post("/admin/login", { email, password });
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

export async function getProviders() {
  const { data } = await api.get("/admin/providers");
  return Array.isArray(data) ? data : [];
}
