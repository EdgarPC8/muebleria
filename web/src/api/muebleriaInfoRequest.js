import axios, { jwt } from "./axios.js";

const auth = () => ({ headers: { Authorization: jwt() } });

export const getMuebleriaInfoRequest = () => axios.get("/muebleria-info");

export const updateMuebleriaInfoRequest = (data) =>
  axios.put("/muebleria-info", data, auth());

export const uploadMuebleriaLogoRequest = (file) => {
  const fd = new FormData();
  fd.append("logo", file);
  return axios.post("/muebleria-info/logo", fd, {
    headers: { Authorization: jwt(), "Content-Type": "multipart/form-data" },
  });
};
