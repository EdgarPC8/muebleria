/** Rutas /accounts: perfil, sesión y cuentas. */
import { Router } from "express";
import {
  updateAccountUser,
  resetPassword,
  getAccounts,
  getOneAccount,
  addAccount,
  deleteAccount,
  updateAccount,
  getAccount,
  getRoles,
  getOneRol,
  addRol,
  deleteRol,
  updateRol,
} from "../controllers/AccountController.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddelware.js";

const router = new Router();

router.get("/account/:accountId/:rolId", isAuthenticated, getAccount);
router.put("/account/updateAccountUser/:id/:userId/:rolId", isAuthenticated, updateAccountUser);

router.get("/account", isAuthenticated, isAdmin, getAccounts);
router.get("/account/:id", isAuthenticated, isAdmin, getOneAccount);
router.post("/account", isAuthenticated, isAdmin, addAccount);
router.delete("/account/:id", isAuthenticated, isAdmin, deleteAccount);
router.put("/account/resetPassword/:id", isAuthenticated, isAdmin, resetPassword);
router.put("/account/:id", isAuthenticated, isAdmin, updateAccount);

router.get("/rol", isAuthenticated, isAdmin, getRoles);
router.get("/rol/:id", isAuthenticated, isAdmin, getOneRol);
router.post("/rol", isAuthenticated, isAdmin, addRol);
router.delete("/rol/:id", isAuthenticated, isAdmin, deleteRol);
router.put("/rol/:id", isAuthenticated, isAdmin, updateRol);

export default router;
