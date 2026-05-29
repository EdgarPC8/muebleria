/**
 * Configuración de la aplicación (singleton en BD). Lectura pública; edición solo Programador.
 */
import { AppSettings } from "../models/AppSettings.js";

const DEFAULTS = {
  id: 1,
  appName: "Mueblería Calva Cueva",
  version: "1.0.0",
  description:
    "Sistema de gestión y control de inventario: productos, clientes, movimientos de stock, reportes y administración del negocio.",
  authors: "Patricio Briceño, Edgar Torres",
  logoPath: "branding/logo-calva-cueva.png",
};

async function getOrCreateSettings() {
  let row = await AppSettings.findByPk(1);
  if (!row) {
    row = await AppSettings.create(DEFAULTS);
  }
  return row;
}

export const getAppSettings = async (_req, res) => {
  try {
    const row = await getOrCreateSettings();
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al obtener configuración." });
  }
};

export const updateAppSettings = async (req, res) => {
  try {
    const row = await getOrCreateSettings();
    const { appName, version, description, authors, logoPath } = req.body;

    await row.update({
      appName: appName?.trim() || row.appName,
      version: version?.trim() || row.version,
      description: description ?? row.description,
      authors: authors?.trim() || row.authors,
      logoPath: logoPath?.trim() || row.logoPath,
    });
    await row.reload();

    res.json({
      message: "Configuración actualizada correctamente.",
      ...row.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al actualizar configuración." });
  }
};

export const updateAppSettingsLogo = async (req, res) => {
  try {
    const rel = req.imageManager?.relativePath;
    if (!rel) {
      return res.status(400).json({ message: "No se recibió imagen de logo." });
    }
    const row = await getOrCreateSettings();
    await row.update({ logoPath: rel });
    await row.reload();
    res.json({
      message: "Logo actualizado correctamente.",
      ...row.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al actualizar logo." });
  }
};

export { getOrCreateSettings, DEFAULTS };
