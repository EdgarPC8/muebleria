/**
 * Subida y eliminación de foto de perfil (users.photo → src/img/photos/).
 */
import multer from "multer";
import path from "path";
import fs from "fs";
import { unlink } from "fs/promises";
import { fileURLToPath } from "url";
import { Users } from "../models/Users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMG_BASE_DIR = path.join(__dirname, "../img");
const photosFolderRel = "photos";
const photosDestination = path.join(IMG_BASE_DIR, photosFolderRel);

const ensurePhotosDir = () => {
  if (!fs.existsSync(photosDestination)) {
    fs.mkdirSync(photosDestination, { recursive: true });
  }
};

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensurePhotosDir();
      cb(null, photosDestination);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const photoName = `userPhotoProfileId${req.params.userId}${ext}`;
    cb(null, photoName);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
    if (!allowed.has(ext)) {
      return cb(new Error("Formato de imagen no permitido"));
    }
    cb(null, true);
  },
}).single("photo");

const safeUnlink = async (fullPath) => {
  try {
    await unlink(fullPath);
  } catch {
    /* ignorar */
  }
};

export const assertOwnPhoto = (req, res, next) => {
  const targetId = Number(req.params.userId);
  const sessionUserId = Number(req.user?.userId);
  if (!targetId || targetId !== sessionUserId) {
    return res.status(403).json({ message: "Solo puede modificar su propia foto de perfil." });
  }
  next();
};

export const uploadPhoto = async (req, res) => {
  const user = await Users.findOne({
    attributes: ["photo"],
    where: { id: req.params.userId },
  });
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const oldRelPath = user.photo || null;

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: `Error al subir la foto: ${err.message}` });
    }

    try {
      if (!req.file?.filename) {
        return res.status(400).json({ message: "No se recibió archivo" });
      }

      const newRelPath = `${photosFolderRel}/${req.file.filename}`;
      await Users.update({ photo: newRelPath }, { where: { id: req.params.userId } });

      if (oldRelPath && oldRelPath !== newRelPath) {
        await safeUnlink(path.join(IMG_BASE_DIR, oldRelPath));
      }

      return res.json({ message: "Foto de perfil subida con éxito", photo: newRelPath });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  });
};

export const deletePhoto = async (req, res) => {
  const user = await Users.findOne({
    attributes: ["photo"],
    where: { id: req.params.userId },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const photoToDelete = user.photo;
  if (!photoToDelete) {
    return res.status(404).json({ message: "No existe imagen para eliminar" });
  }

  try {
    await safeUnlink(path.join(IMG_BASE_DIR, photoToDelete));
    await Users.update({ photo: null }, { where: { id: req.params.userId } });
    return res.json({ message: "Foto de perfil eliminada con éxito" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
