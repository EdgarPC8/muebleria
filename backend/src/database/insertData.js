/**
 * Backup/restore: exportar BD a JSON, importar backup.json y descarga para admin.
 */
import { promises as fs } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { sequelize } from "./connection.js";
import "../models/index.js";
import { Roles } from "../models/Roles.js";
import { Users } from "../models/Users.js";
import { Account, AccountRoles } from "../models/Account.js";
import { Notifications } from "../models/Notifications.js";
import { UserData } from "../models/UserData.js";
import { Logs } from "../models/Logs.js";
import { NotificationProgram } from "../models/NotificationProgram.js";
import { applyMuebleriaBackup, exportMuebleriaBackup } from "./muebleriaBackup.js";

/** JSON principal de respaldo (auth + catálogo + pedidos de prueba). */
export const backupFilePath = resolve(__dirname, "backup.json");
export const backups = resolve(__dirname, "..", "backups");

const BULK_OPT = { returning: false };

const emptyBackup = () => ({
  _comentarios: {
    Roles: "Roles del sistema (Programador, Administrador, Empleado).",
    Users: "Personas vinculadas a cuentas de acceso.",
    Account: "Credenciales de login (username/password bcrypt).",
    AccountRoles: "Relación N:M cuenta ↔ rol.",
    MeasureUnits: "Unidades de medida para productos (und, juego, metro…).",
    ProductCategories: "Categorías del catálogo (Sala, Comedor, etc.).",
    Brands: "Marcas comerciales de muebles.",
    Suppliers: "Proveedores de mercadería.",
    StoreProducts: "Productos con stock, precio e impuestos.",
    Customers: "Clientes de la tienda.",
    SaleOrders: "Pedidos de clientes (cabecera).",
    SaleOrderItems: "Líneas de pedidos de clientes.",
    SupplierOrders: "Pedidos a proveedores (cabecera).",
    SupplierOrderItems: "Líneas de pedidos a proveedor.",
    StockMovements: "Kardex de inventario: entradas, salidas y ajustes de stock.",
  },
  Roles: [],
  Users: [],
  UserData: [],
  Account: [],
  AccountRoles: [],
  Notifications: [],
  NotificationProgram: [],
  Logs: [],
  MeasureUnits: [],
  ProductCategories: [],
  Brands: [],
  Suppliers: [],
  StoreProducts: [],
  Customers: [],
  SaleOrders: [],
  SaleOrderItems: [],
  SupplierOrders: [],
  SupplierOrderItems: [],
  StockMovements: [],
});

async function applyBackupFromJson(jsonData, opts = {}) {
  const { skipIfEmpty = false } = opts;
  const roles = jsonData.Roles || [];
  const accounts = jsonData.Account || [];
  if (skipIfEmpty && roles.length === 0 && accounts.length === 0) {
    console.log("ℹ️  backup.json sin Roles ni Account; no se inserta nada.");
    return false;
  }

  const t = await sequelize.transaction();
  try {
    const opt = { ...BULK_OPT, transaction: t };

    await Roles.bulkCreate(jsonData.Roles || [], opt);
    await Users.bulkCreate(jsonData.Users || [], opt);
    await UserData.bulkCreate(jsonData.UserData || [], opt);
    await Account.bulkCreate(jsonData.Account || [], opt);
    await AccountRoles.bulkCreate(jsonData.AccountRoles || [], opt);
    await Notifications.bulkCreate(jsonData.Notifications || [], opt);
    await NotificationProgram.bulkCreate(jsonData.NotificationProgram || [], opt);
    await Logs.bulkCreate(jsonData.Logs || [], opt);

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  return true;
}

export async function insertDataIfEmpty() {
  try {
    const cuentaCount = await Account.count();
    if (cuentaCount > 0) {
      console.log("ℹ️  BD ya tiene cuentas; omitiendo importación inicial desde backup.json.");
      return;
    }

    let jsonData;
    try {
      const raw = await fs.readFile(backupFilePath, "utf8");
      jsonData = JSON.parse(raw);
    } catch (e) {
      if (e.code === "ENOENT") {
        await fs.writeFile(backupFilePath, JSON.stringify(emptyBackup(), null, 2));
        console.log("📄 Creado backup.json vacío en:", backupFilePath);
        return;
      }
      throw e;
    }

    const ok = await applyBackupFromJson(jsonData, { skipIfEmpty: true });
    if (ok) {
      console.log("✅ Datos iniciales cargados desde backup.json (muebleria).");
    }
  } catch (error) {
    console.error("❌ Error importando backup al inicio:", error.message);
  }
}

export const insertData = async () => {
  try {
    await fs.access(backupFilePath);
    const data = await fs.readFile(backupFilePath, "utf8");
    const jsonData = JSON.parse(data);

    await applyBackupFromJson(jsonData, { skipIfEmpty: false });

    console.log("✅ Datos insertados desde backup.json (muebleria).");
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(backupFilePath, JSON.stringify(emptyBackup(), null, 2));
      console.log("📄 Creado backup.json vacío en:", backupFilePath);
    } else {
      console.error("Error al insertar datos:", error);
      throw error;
    }
  }
};

export const saveBackup = async () => {
  const [
    rolesData,
    usersData,
    userDataRows,
    accountData,
    accountRolesData,
    notificationsData,
    notificationProgramData,
    logsData,
  ] = await Promise.all([
    Roles.findAll({ raw: true }),
    Users.findAll({ raw: true }),
    UserData.findAll({ raw: true }),
    Account.findAll({ raw: true }),
    AccountRoles.findAll({ raw: true }),
    Notifications.findAll({ raw: true }),
    NotificationProgram.findAll({ raw: true }),
    Logs.findAll({ raw: true }),
  ]);

  const muebleriaData = await exportMuebleriaBackup();

  const backupData = {
    _comentarios: emptyBackup()._comentarios,
    Roles: rolesData,
    Users: usersData,
    UserData: userDataRows,
    Account: accountData,
    AccountRoles: accountRolesData,
    Notifications: notificationsData,
    NotificationProgram: notificationProgramData,
    Logs: logsData,
    ...muebleriaData,
  };

  await fs.mkdir(backups, { recursive: true });

  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  const backupFileName = `backup-${timestamp}.json`;
  const backupPath = resolve(backups, backupFileName);

  await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
  await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2));

  console.log("Backup muebleria guardado en:", backupPath);
  return backupPath;
};

/** Descarga backup.json; el mensaje de éxito va en cabecera para el toast del frontend. */
export const downloadBackup = async (req, res) => {
  try {
    const backupPath = await saveBackup();
    res.setHeader("X-Api-Message", "Backup descargado correctamente.");
    res.download(backupPath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error al enviar el archivo de backup." });
        }
      }
    });
  } catch (error) {
    console.error("Error al realizar el backup:", error);
    res.status(500).json({ message: "Error al realizar el backup." });
  }
};
