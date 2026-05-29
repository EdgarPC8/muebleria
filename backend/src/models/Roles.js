/** Modelo Sequelize: roles del sistema (Administrador, Vendedor, etc.). */
import { DataTypes } from "sequelize";
import { sequelize } from "../database/connection.js";

const Roles = sequelize.define(
  "roles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  }
);

export { Roles };
