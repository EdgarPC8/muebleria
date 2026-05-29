/**
 * Middleware que persiste logs de peticiones (excepto GET, OPTIONS, HEAD).
 */
import { Logs } from "../models/Logs.js";

const SKIP_METHODS = new Set(["GET", "OPTIONS", "HEAD"]);

export const loggerMiddleware = (req, res, next) => {
  if (SKIP_METHODS.has(req.method)) {
    next();
    return;
  }

  Logs.create({
    httpMethod: req.method,
    action: "request",
    endPoint: req.originalUrl,
    description: `${req.method} ${req.originalUrl}`,
    system: "muebleria",
  }).catch(() => {
    // Mantener el request vivo aunque falle el insert de logs
  });

  next();
};
