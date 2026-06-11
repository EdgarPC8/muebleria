import { getOrCreateInfo } from "../controllers/MuebleriaInfoController.js";

export async function seedMuebleriaInfoIfEmpty() {
  await getOrCreateInfo();
}
