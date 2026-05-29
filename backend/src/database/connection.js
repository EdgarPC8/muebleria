/**
 * Conexión Sequelize a MySQL (base `muebleria`).
 * Crear antes: CREATE DATABASE muebleria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 */
import Sequelize from "sequelize";

const sequelize = new Sequelize("muebleria", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "-05:00",
});

export { sequelize };
