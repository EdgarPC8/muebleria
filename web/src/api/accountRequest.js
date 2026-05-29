/** Peticiones de cuenta: perfil y roles asignados. */
import axios, { jwt } from "./axios.js";

export const getAccount = (accountId, rolId) =>
  axios.get(`/account/${accountId}/${rolId}`, {
    headers: { Authorization: jwt() },
  });

export const getRolRequest = () => axios.get("/rol");
