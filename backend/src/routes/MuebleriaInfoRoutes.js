import { Router } from "express";
import {
  getMuebleriaInfo,
  updateMuebleriaInfo,
  updateMuebleriaInfoLogo,
} from "../controllers/MuebleriaInfoController.js";
import {
  isAuthenticated,
  isProgramador,
  isAdmin,
} from "../middlewares/authMiddelware.js";
import { makeImageUpload } from "../middlewares/imgMiddleware.js";

const router = new Router();

router.get("/", getMuebleriaInfo);

router.put("/", isAuthenticated, isAdmin, updateMuebleriaInfo);

router.post(
  "/logo",
  isAuthenticated,
  isProgramador,
  makeImageUpload({
    fieldName: "logo",
    folderResolver: () => "branding",
    nameResolver: () => "logo-negocio.png",
    forceReplace: true,
  }),
  updateMuebleriaInfoLogo,
);

export default router;
