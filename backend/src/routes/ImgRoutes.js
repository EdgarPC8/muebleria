/** Rutas /img: subida y gestión de imágenes (solo Programador). */
import { Router } from "express";
import {
  uploadImage,
  deleteImage,
  scanImages as scanImagesController,
  downloadFolderZip,
} from "../controllers/ImgController.js";
import { isAuthenticated, isProgramador } from "../middlewares/authMiddelware.js";
import {
  makeImageUpload,
  deleteImage as deleteImageMiddleware,
  scanImages,
  deleteFolder,
} from "../middlewares/imgMiddleware.js";

const router = new Router();
const guard = [isAuthenticated, isProgramador];

router.get("/download", ...guard, downloadFolderZip);

router.post("/upload", ...guard, makeImageUpload({ fieldName: "file" }), uploadImage);

router.delete("/delete", ...guard, deleteImageMiddleware(), deleteImage);

router.get("/scan", ...guard, scanImages(), scanImagesController);

router.delete("/folder", ...guard, deleteFolder(), (req, res) => {
  res.json({ message: "Carpeta eliminada correctamente.", ...req.imageManager });
});

export default router;
