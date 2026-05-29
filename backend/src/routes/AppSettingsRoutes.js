/** Rutas de configuración de la app (Info del sistema). */
import { Router } from "express";
import {
  getAppSettings,
  updateAppSettings,
  updateAppSettingsLogo,
} from "../controllers/AppSettingsController.js";
import { isAuthenticated, isProgramador } from "../middlewares/authMiddelware.js";
import { makeImageUpload } from "../middlewares/imgMiddleware.js";

const router = new Router();

router.get("/", getAppSettings);

router.put("/", isAuthenticated, isProgramador, updateAppSettings);

router.post(
  "/logo",
  isAuthenticated,
  isProgramador,
  makeImageUpload({
    fieldName: "logo",
    folderResolver: () => "branding",
    nameResolver: () => "logo-calva-cueva.png",
    forceReplace: true,
  }),
  updateAppSettingsLogo
);

export default router;
