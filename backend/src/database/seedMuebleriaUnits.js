import { MeasureUnit } from "../models/Muebleria.js";

/** Unidades para mueblería (piezas, juegos, medidas lineales — sin peso/granos). */
const DEFAULT_UNITS = [
  { name: "Unidad", abbreviation: "und", groupName: "unit", factorToBase: 1, isBase: true },
  { name: "Juego", abbreviation: "jgo", groupName: "unit", factorToBase: 1, isBase: false },
  { name: "Par", abbreviation: "par", groupName: "unit", factorToBase: 1, isBase: false },
  { name: "Set", abbreviation: "set", groupName: "unit", factorToBase: 1, isBase: false },
  { name: "Metro", abbreviation: "m", groupName: "length", factorToBase: 1, isBase: true },
  { name: "Centímetro", abbreviation: "cm", groupName: "length", factorToBase: 0.01, isBase: false },
  { name: "Metro cuadrado", abbreviation: "m²", groupName: "area", factorToBase: 1, isBase: true },
];

export async function seedMuebleriaUnitsIfEmpty() {
  const count = await MeasureUnit.count();
  if (count > 0) return;
  await MeasureUnit.bulkCreate(DEFAULT_UNITS);
  console.log("✅ Unidades base de mueblería creadas.");
}
