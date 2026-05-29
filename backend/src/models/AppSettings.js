/** Configuración pública de la app (nombre, versión, logo, autores). Fila única id=1. */
import { DataTypes } from "sequelize";
import { sequelize } from "../database/connection.js";

export const AppSettings = sequelize.define(
  "app_settings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    appName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "Mueblería Calva Cueva",
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "1.0.0",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    authors: {
      type: DataTypes.STRING(300),
      allowNull: true,
      defaultValue: "Patricio Briceño, Edgar Torres",
    },
    logoPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Ruta relativa bajo /img, ej. branding/logo.png",
    },
  },
  {
    timestamps: true,
  }
);
