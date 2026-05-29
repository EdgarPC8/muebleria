import axios, { authHeaders, jwt } from "./axios.js";

const auth = () => authHeaders();

export const getSuppliers = () => axios.get("/muebleria/suppliers", auth());
export const createSupplier = (payload) => axios.post("/muebleria/suppliers", payload, auth());

export const getUnits = () => axios.get("/muebleria/units", auth());
export const createUnit = (payload) => axios.post("/muebleria/units", payload, auth());

export const getCategories = () => axios.get("/muebleria/categories", auth());
export const createCategory = (payload) => axios.post("/muebleria/categories", payload, auth());

export const getBrands = () => axios.get("/muebleria/brands", auth());
export const createBrand = (payload) => axios.post("/muebleria/brands", payload, auth());

export const getProducts = () => axios.get("/muebleria/products", auth());
export const createProduct = (payload) => {
  const authorization = jwt();
  const headers =
    payload instanceof FormData
      ? authorization
        ? { Authorization: authorization }
        : {}
      : auth().headers;
  return axios.post("/muebleria/products", payload, { headers });
};
export const updateProduct = (id, payload) => {
  const authorization = jwt();
  const headers =
    payload instanceof FormData
      ? authorization
        ? { Authorization: authorization }
        : {}
      : auth().headers;
  return axios.put(`/muebleria/products/${id}`, payload, { headers });
};

export const getCustomers = () => axios.get("/muebleria/customers", auth());
export const createCustomer = (payload) => axios.post("/muebleria/customers", payload, auth());
export const updateCustomer = (id, payload) => axios.put(`/muebleria/customers/${id}`, payload, auth());
