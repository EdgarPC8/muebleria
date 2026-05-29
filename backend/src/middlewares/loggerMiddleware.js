import { Logs } from "../models/Logs.js";

export const loggerMiddleware = (req, res, next) => {
  if (req.method === "GET") {
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
