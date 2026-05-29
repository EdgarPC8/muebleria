import { DataTypes } from "sequelize";
import { sequelize } from "../database/connection.js";

export const NotificationProgram = sequelize.define(
  "notification_programs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    scheduleType: {
      type: DataTypes.ENUM("daily", "manual"),
      defaultValue: "manual",
    },
    scheduleTime: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    scopeType: {
      type: DataTypes.ENUM("user", "account"),
      defaultValue: "user",
    },
    targetType: {
      type: DataTypes.ENUM("all_users", "by_role"),
      defaultValue: "all_users",
    },
    targetRoleIds: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true }
);
