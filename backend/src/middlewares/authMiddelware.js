/**
 * Middleware JWT: isAuthenticated, isAdmin y carga de req.user.
 */
import { getHeaderToken, verifyJWT } from "../libs/jwt.js";
import { Account } from "../models/Account.js";
import { Roles } from "../models/Roles.js";

const ROLES_ADMIN = ["Administrador", "Programador"];

const isAuthenticated = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader)
      return res.status(401).json({ message: "No token, unauthorized" });

    const token = getHeaderToken(req);
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Token inválido" });
    }

    const verify = await verifyJWT(token);
    req.user = verify;

    next();
  } catch (error) {
    const isJwtError =
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError" ||
      String(error?.message || "").toLowerCase().includes("jwt");
    return res.status(isJwtError ? 401 : 500).json({
      message: isJwtError ? "Sesión inválida o expirada" : error.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const accountId = req.user?.accountId;
    if (!accountId) return res.status(401).json({ message: "No autenticado" });
    const account = await Account.findByPk(accountId, {
      include: [{ model: Roles, as: "roles", through: { attributes: [] } }],
    });
    if (!account?.roles?.some((r) => ROLES_ADMIN.includes(r.name))) {
      return res.status(403).json({ message: "Solo administradores o programador" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isProgramador = async (req, res, next) => {
  if (String(req.user?.loginRol || "") !== "Programador") {
    return res.status(403).json({ message: "Solo programador" });
  }
  next();
};

export { isAuthenticated, isAdmin, isProgramador };
