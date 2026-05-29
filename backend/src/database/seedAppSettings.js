/**
 * Crea la fila de configuración de la app si no existe.
 */
import { getOrCreateSettings } from "../controllers/AppSettingsController.js";

export async function seedAppSettingsIfEmpty() {
  await getOrCreateSettings();
}
