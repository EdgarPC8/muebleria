/** Rutas /users: administración de usuarios. */
import { Router } from "express";
import {
  getUsers,
  getOneUser,
  addUser,
  deleteUser,
  updateUserData,
  addUsersBulk,
} from "../controllers/UserController.js";
import { getMyData, updateMyData } from "../controllers/UserDataController.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddelware.js";

const router = new Router();

router.get("/me/data", isAuthenticated, getMyData);
router.put("/me/data", isAuthenticated, updateMyData);

router.post("", isAuthenticated, isAdmin, addUser);
router.post("/bulk", isAuthenticated, isAdmin, addUsersBulk);
router.get("", isAuthenticated, isAdmin, getUsers);
router.delete("/:userId", isAuthenticated, isAdmin, deleteUser);
router.put("/:userId", isAuthenticated, isAdmin, updateUserData);
router.get("/:userId", isAuthenticated, isAdmin, getOneUser);

export default router;
