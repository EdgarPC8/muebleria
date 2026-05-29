import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddelware.js";
import { muebleriaUploadSingle } from "../middlewares/uploadMuebleriaMiddleware.js";
import {
  getSuppliers,
  createSupplier,
  getUnits,
  createUnit,
  getCategories,
  createCategory,
  getBrands,
  createBrand,
  getProducts,
  createProduct,
  updateProduct,
  createPurchase,
  openProductBoxes,
  getPurchases,
  getStockMovements,
  getExpiryAlerts,
  getFinanceEntries,
  createFinanceEntry,
  getFinanceSummary,
  getCustomers,
  createCustomer,
  updateCustomer,
  getOrders,
  createOrder,
  updateOrder,
  getSupplierOrders,
  createSupplierOrder,
  updateSupplierOrder,
  createStockAdjustment,
  getTaskAssignees,
  createTaskPlan,
  publishTaskPlan,
  getTaskPlans,
  getMyTaskItems,
  updateTaskItemStatus,
  executeTaskOpenBox,
} from "../controllers/MuebleriaController.js";

const router = Router();

// Catálogos base
router.get("/suppliers", isAuthenticated, getSuppliers);
router.post("/suppliers", isAuthenticated, createSupplier);
router.get("/units", isAuthenticated, getUnits);
router.post("/units", isAuthenticated, createUnit);
router.get("/categories", isAuthenticated, getCategories);
router.post("/categories", isAuthenticated, createCategory);
router.get("/brands", isAuthenticated, getBrands);
router.post("/brands", isAuthenticated, createBrand);
router.get("/products", isAuthenticated, getProducts);
router.post("/products", isAuthenticated, muebleriaUploadSingle, createProduct);
router.put("/products/:id", isAuthenticated, muebleriaUploadSingle, updateProduct);

// Compras + kardex
router.get("/purchases", isAuthenticated, getPurchases);
router.post("/purchases", isAuthenticated, createPurchase);
router.post("/open-box", isAuthenticated, openProductBoxes);
router.get("/movements", isAuthenticated, getStockMovements);
router.post("/stock-adjustment", isAuthenticated, createStockAdjustment);
router.get("/expiry-alerts", isAuthenticated, getExpiryAlerts);
router.get("/finance/entries", isAuthenticated, getFinanceEntries);
router.post("/finance/entries", isAuthenticated, createFinanceEntry);
router.get("/finance/summary", isAuthenticated, getFinanceSummary);
router.get("/customers", isAuthenticated, getCustomers);
router.post("/customers", isAuthenticated, createCustomer);
router.put("/customers/:id", isAuthenticated, updateCustomer);
router.get("/orders", isAuthenticated, getOrders);
router.post("/orders", isAuthenticated, createOrder);
router.put("/orders/:id", isAuthenticated, updateOrder);
router.get("/supplier-orders", isAuthenticated, getSupplierOrders);
router.post("/supplier-orders", isAuthenticated, createSupplierOrder);
router.put("/supplier-orders/:id", isAuthenticated, updateSupplierOrder);
router.get("/tasks/assignees", isAuthenticated, getTaskAssignees);
router.get("/tasks/plans", isAuthenticated, getTaskPlans);
router.post("/tasks/plans", isAuthenticated, createTaskPlan);
router.post("/tasks/plans/:id/publish", isAuthenticated, publishTaskPlan);
router.get("/tasks/my-items", isAuthenticated, getMyTaskItems);
router.put("/tasks/items/:id/status", isAuthenticated, updateTaskItemStatus);
router.post("/tasks/items/:id/execute-open-box", isAuthenticated, executeTaskOpenBox);

export default router;
