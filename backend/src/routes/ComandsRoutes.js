/** Rutas /comands: backup, recarga BD y logs (admin). */
import { Router } from "express";
import {
  getLogs,
  reloadBdController,
  uploadBackupController,
  saveBackupController,
} from "../controllers/ComandsController.js";
import { downloadBackup } from "../database/insertData.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddelware.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

router.get("/getLogs", isAuthenticated, isAdmin, getLogs);
router.get("/saveBackup", isAuthenticated, saveBackupController);
router.get("/downloadBackup", isAuthenticated, downloadBackup);
router.get("/reloadBD", isAuthenticated, reloadBdController);
router.post("/upload-backup", isAuthenticated, upload.single("backup"), uploadBackupController);

export default router;
