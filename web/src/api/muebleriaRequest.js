/** Cliente API del dominio mueblería (productos, clientes, categorías, etc.). */
import axios, { authHeaders, jwt } from "./axios.js";

const auth = () => authHeaders();

export const getSuppliers = () => axios.get("/muebleria/suppliers", auth());
export const createSupplier = (payload) => axios.post("/muebleria/suppliers", payload, auth());

export const getUnits = () => axios.get("/muebleria/units", auth());
export const createUnit = (payload) => axios.post("/muebleria/units", payload, auth());

export const getCategories = () => axios.get("/muebleria/categories", auth());
export const createCategory = (payload) => axios.post("/muebleria/categories", payload, auth());
export const updateCategory = (id, payload) => axios.put(`/muebleria/categories/${id}`, payload, auth());
export const deleteCategory = (id) => axios.delete(`/muebleria/categories/${id}`, auth());

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
export const deleteCustomer = (id) => axios.delete(`/muebleria/customers/${id}`, auth());

/** Pedidos de clientes (tienda). */
export const getOrders = () => axios.get("/muebleria/orders", auth());
export const createOrder = (payload) => axios.post("/muebleria/orders", payload, auth());
export const updateOrder = (id, payload) => axios.put(`/muebleria/orders/${id}`, payload, auth());

/** Pedidos a proveedores. Al marcar recibido el backend ingresa stock. */
export const getSupplierOrders = () => axios.get("/muebleria/supplier-orders", auth());
export const createSupplierOrder = (payload) => axios.post("/muebleria/supplier-orders", payload, auth());
export const updateSupplierOrder = (id, payload) => axios.put(`/muebleria/supplier-orders/${id}`, payload, auth());

/** Kardex de movimientos de inventario. */
export const getStockMovements = () => axios.get("/muebleria/movements", auth());
export const createStockAdjustment = (payload) =>
  axios.post("/muebleria/stock-adjustment", payload, auth());

/** Resumen financiero para panel (ingresos, gastos, deudas, series). */
export const getFinanceSummary = (params = {}) =>
  axios.get("/muebleria/finance/summary", { ...auth(), params });

/** Conteos de registros del negocio (panel / gráfica panorama). */
export const getDashboardStats = () => axios.get("/muebleria/dashboard/stats", auth());

/** Esquema de tablas y relaciones para diagrama ER en documentación. */
export const getDatabaseSchema = () => axios.get("/muebleria/database/schema", auth());
