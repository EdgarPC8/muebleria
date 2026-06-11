import { MuebleriaInfo } from "../models/MuebleriaInfo.js";

const DEFAULT_LOGO_FOLDER = "branding";
const DEFAULT_LOGO_NAME = "logo-negocio.png";

const DEFAULTS = {
  id: 1,
  businessName: "Comercial Calva Cueva",
  ownerName: "",
  ruc: "",
  address: "",
  phone: "",
  secondaryPhone: "",
  email: "",
  openingHours: "",
  city: "",
  description: "",
};

async function getOrCreateInfo() {
  let row = await MuebleriaInfo.findByPk(1);
  if (!row) {
    row = await MuebleriaInfo.create(DEFAULTS);
  }
  return row;
}

export const getMuebleriaInfo = async (_req, res) => {
  try {
    const row = await getOrCreateInfo();
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al obtener información del negocio." });
  }
};

export const updateMuebleriaInfo = async (req, res) => {
  try {
    const row = await getOrCreateInfo();
    const { businessName, ownerName, ruc, address, phone, secondaryPhone, email, openingHours, city, description, logoPath } = req.body;

    await row.update({
      businessName: businessName?.trim() || row.businessName,
      ownerName: ownerName?.trim() || row.ownerName,
      ruc: ruc?.trim() || row.ruc,
      address: address?.trim() || row.address,
      phone: phone?.trim() || row.phone,
      secondaryPhone: secondaryPhone?.trim() || row.secondaryPhone,
      email: email?.trim() || row.email,
      openingHours: openingHours?.trim() || row.openingHours,
      city: city?.trim() || row.city,
      description: description ?? row.description,
      logoPath: logoPath?.trim() || row.logoPath,
    });
    await row.reload();

    res.json({
      message: "Información del negocio actualizada correctamente.",
      ...row.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al actualizar información del negocio." });
  }
};

export const updateMuebleriaInfoLogo = async (req, res) => {
  try {
    const rel = req.imageManager?.relativePath;
    if (!rel) {
      return res.status(400).json({ message: "No se recibió imagen de logo." });
    }
    const row = await getOrCreateInfo();
    await row.update({ logoPath: rel });
    await row.reload();
    res.json({
      message: "Logo del negocio actualizado correctamente.",
      ...row.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al actualizar logo del negocio." });
  }
};

export { getOrCreateInfo, DEFAULTS, DEFAULT_LOGO_FOLDER, DEFAULT_LOGO_NAME };
