/**
 * Cliente HTTP y Socket.IO: base URL, token JWT e interceptores.
 */
import axios from "axios";
import { io } from "socket.io-client";

// ─── Cambia solo aquí ───────────────────────────────────────────
/** 'local' | 'server' | 'production' */
const API_ENV = "server";
const API_PATH = "muebleriaapi";
const API_PORT = 3007;
/** Servidor en red (pruebas / despliegue interno) */
const SERVER_HOST = "192.168.110.199";
const PRODUCTION_ORIGIN = "https://aplicaciones.marianosamaniego.edu.ec";
// ─────────────────────────────────────────────────────────────────

/**
 * Base del API muebleria:
 * - local + npm run dev: proxy Vite → localhost:3007
 * - local + build: http://localhost:3007/muebleriaapi
 * - server: http://SERVER_HOST:3007/muebleriaapi
 * - production: https://aplicaciones.marianosamaniego.edu.ec/muebleriaapi
 */
function resolveApiBase() {
  if (API_ENV === "production") {
    return `${PRODUCTION_ORIGIN}/${API_PATH}`;
  }
  if (API_ENV === "server") {
    return `http://${SERVER_HOST}:${API_PORT}/${API_PATH}`;
  }
  // local
  if (import.meta.env.DEV) {
    return `/${API_PATH}`;
  }
  return `http://localhost:${API_PORT}/${API_PATH}`;
}

/** Origen para Socket.IO (mismo host que el backend, sin /muebleriaapi). */
function resolveSocketOrigin() {
  if (API_ENV === "production") return PRODUCTION_ORIGIN;
  if (API_ENV === "server") return `http://${SERVER_HOST}:${API_PORT}`;
  if (import.meta.env.DEV) return window.location.origin;
  return `http://localhost:${API_PORT}`;
}

const baseURL = resolveApiBase();
const socketOrigin = resolveSocketOrigin();

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export const pathImg = `${baseURL.replace(/\/$/, "")}/img/`;

export const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^(https?:|data:)/i.test(imagePath)) return imagePath;
  const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${pathImg}${clean}`;
};

export const socket = io(socketOrigin, { withCredentials: true });

export function isValidJwtShape(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export function normalizeToken(raw) {
  if (raw == null) return null;
  let token = String(raw).trim();
  if (!token || token === "null" || token === "undefined") return null;
  if (token.toLowerCase().startsWith("bearer ")) token = token.slice(7).trim();
  return isValidJwtShape(token) ? token : null;
}

export const getToken = () => normalizeToken(localStorage.getItem("token"));

export const setToken = (raw) => {
  const token = normalizeToken(raw);
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
  return token;
};

export const clearToken = () => localStorage.removeItem("token");

export const jwt = () => {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
};

export const authHeaders = () => {
  const authorization = jwt();
  return authorization ? { headers: { Authorization: authorization } } : {};
};

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg = String(error?.response?.data?.message || "").toLowerCase();
    if (
      status === 401 &&
      (msg.includes("jwt") || msg.includes("token") || msg.includes("unauthorized"))
    ) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

if (!getToken() && localStorage.getItem("token")) clearToken();

export default instance;
