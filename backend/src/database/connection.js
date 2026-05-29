import Sequelize from "sequelize";

/**
 * Base `muebleria` — créala antes en MySQL:
 *   CREATE DATABASE muebleria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 */
const sequelize = new Sequelize("muebleria", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "-05:00",
});

export { sequelize };
