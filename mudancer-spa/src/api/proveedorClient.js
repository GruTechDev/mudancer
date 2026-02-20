/**
 * Axios client for proveedor API. Token from localStorage (key: provider_token).
 * Base URL: VITE_API_URL (production VPS) or /api.
 */
import axios from "axios";

const PROVIDER_TOKEN_KEY = "provider_token";

export function getProviderToken() {
  return localStorage.getItem(PROVIDER_TOKEN_KEY);
}

export function setProviderToken(token) {
  if (token) localStorage.setItem(PROVIDER_TOKEN_KEY, token);
  else localStorage.removeItem(PROVIDER_TOKEN_KEY);
}

const baseURL = (import.meta.env.VITE_API_URL ?? "").trim()
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, "")}/api`
  : "/api";

export const proveedorApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

proveedorApi.interceptors.request.use((config) => {
  const token = getProviderToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

proveedorApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setProviderToken(null);
      if (window.location.pathname.startsWith("/proveedor") && !window.location.pathname.endsWith("/login")) {
        window.location.href = "/proveedor/login";
      }
    }
    return Promise.reject(err);
  }
);
