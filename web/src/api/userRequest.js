/** Peticiones de usuario: login y sesión actual. */
import axios, { authHeaders, jwt } from "./axios.js";

export const loginRequest = (data) => axios.post("/login", data);
export const getSessionRequest = () => axios.get("/getSession", authHeaders());
export const getUsersRequest = () =>
  axios.get("/users", { headers: { Authorization: jwt() } });
