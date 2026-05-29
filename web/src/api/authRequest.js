import axios, { jwt } from "./axios.js";

export const changeRole = (data) =>
  axios.post("/changeRole", data, {
    headers: { Authorization: jwt() },
  });
