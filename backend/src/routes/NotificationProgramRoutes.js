/** Rutas /notification-programs: CRUD y envío de programadas. */
import { Router } from "express";
import {
  getAll,
  create,
  update,
  remove,
  sendNow,
} from "../controllers/NotificationProgramController.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddelware.js";

const router = new Router();

router.get("/", isAuthenticated, isAdmin, getAll);
router.post("/", isAuthenticated, isAdmin, create);
router.put("/:id", isAuthenticated, isAdmin, update);
router.delete("/:id", isAuthenticated, isAdmin, remove);
router.post("/:id/send", isAuthenticated, isAdmin, sendNow);

export default router;
