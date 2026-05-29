/**
 * Creación y verificación de tokens JWT de sesión.
 */
import jwt from "jsonwebtoken";

const SECRET = "privateKey";

function createAccessToken({ payload }) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      SECRET,
      { algorithm: "HS256", expiresIn: "1d" },
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
}

function getHeaderToken(req) {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string") return null;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

export { createAccessToken, getHeaderToken, verifyJWT };
