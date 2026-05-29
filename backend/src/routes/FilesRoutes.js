/** Rutas /files: gestión de documentos y archivos (solo Programador). */
import { Router } from "express";
import {
  uploadFile,
  deleteFile as deleteFileController,
  scanFiles as scanFilesController,
  deleteFolder as deleteFolderController,
  downloadFolderZip,
  downloadFile,
  viewFileInline,
} from "../controllers/FilesController.js";
import { isAuthenticated, isProgramador } from "../middlewares/authMiddelware.js";
import {
  makeFileUpload,
  deleteFile as deleteFileMiddleware,
  scanFiles,
  deleteFolder,
} from "../middlewares/fileManagerMiddleware.js";

const router = new Router();
const guard = [isAuthenticated, isProgramador];

router.get("/download", ...guard, downloadFolderZip);
router.post("/upload", ...guard, makeFileUpload({ fieldName: "file" }), uploadFile);
router.delete("/delete", ...guard, deleteFileMiddleware(), deleteFileController);
router.get("/scan", ...guard, scanFiles(), scanFilesController);
router.delete("/folder", ...guard, deleteFolder(), deleteFolderController);
router.get("/file/download", ...guard, downloadFile);
router.get("/file/view", ...guard, viewFileInline);

export default router;
