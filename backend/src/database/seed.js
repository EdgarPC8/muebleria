/**
 * Datos iniciales (roles + usuario admin) desde backup.json.
 * Ejecutar: npm run seed
 */
import { sequelize } from "./connection.js";
import { insertData } from "./insertData.js";

async function main() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await insertData();
    console.log("✅ Seed muebleria completado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed:", error.message);
    process.exit(1);
  }
}

main();
