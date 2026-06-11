import { DataTypes } from "sequelize";
import { sequelize } from "../database/connection.js";

export const MuebleriaInfo = sequelize.define(
  "muebleria_info",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    businessName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "Comercial Calva Cueva",
    },
    ownerName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ruc: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    secondaryPhone: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    openingHours: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logoPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Ruta relativa bajo /img, ej. branding/logo-negocio.png",
    },
  },
  {
    timestamps: true,
  }
);
