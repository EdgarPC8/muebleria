/**
 * Importación y exportación de datos de negocio (catálogo, clientes, pedidos)
 * desde/hacia backup.json. Se ejecuta en recarga de BD y al arrancar si las tablas están vacías.
 */
import {
  MeasureUnit,
  ProductCategory,
  Brand,
  Supplier,
  StoreProduct,
  Customer,
  SaleOrder,
  SaleOrderItem,
  SupplierOrder,
  SupplierOrderItem,
  StockMovement,
} from "../models/Muebleria.js";

const BULK_OPT = { returning: false };

/** Ignora claves meta del JSON (_comentarios, etc.). */
const pickData = (jsonData, key) => (Array.isArray(jsonData?.[key]) ? jsonData[key] : []);

export async function applyMuebleriaBackup(jsonData, transaction) {
  const opt = { ...BULK_OPT, transaction };

  const units = pickData(jsonData, "MeasureUnits");
  const categories = pickData(jsonData, "ProductCategories");
  const brands = pickData(jsonData, "Brands");
  const suppliers = pickData(jsonData, "Suppliers");
  const products = pickData(jsonData, "StoreProducts");
  const customers = pickData(jsonData, "Customers");
  const saleOrders = pickData(jsonData, "SaleOrders");
  const saleOrderItems = pickData(jsonData, "SaleOrderItems");
  const supplierOrders = pickData(jsonData, "SupplierOrders");
  const supplierOrderItems = pickData(jsonData, "SupplierOrderItems");
  const stockMovements = pickData(jsonData, "StockMovements");

  if (
    units.length +
      categories.length +
      brands.length +
      suppliers.length +
      products.length +
      customers.length ===
    0
  ) {
    return false;
  }

  if (units.length) await MeasureUnit.bulkCreate(units, opt);

  // Categorías padre antes que hijas (parentId null primero)
  if (categories.length) {
    const parents = categories.filter((c) => !c.parentId);
    const children = categories.filter((c) => c.parentId);
    if (parents.length) await ProductCategory.bulkCreate(parents, opt);
    if (children.length) await ProductCategory.bulkCreate(children, opt);
  }

  if (brands.length) await Brand.bulkCreate(brands, opt);
  if (suppliers.length) await Supplier.bulkCreate(suppliers, opt);
  if (products.length) await StoreProduct.bulkCreate(products, opt);
  if (customers.length) await Customer.bulkCreate(customers, opt);
  if (saleOrders.length) await SaleOrder.bulkCreate(saleOrders, opt);
  if (saleOrderItems.length) await SaleOrderItem.bulkCreate(saleOrderItems, opt);
  if (supplierOrders.length) await SupplierOrder.bulkCreate(supplierOrders, opt);
  if (supplierOrderItems.length) await SupplierOrderItem.bulkCreate(supplierOrderItems, opt);
  if (stockMovements.length) await StockMovement.bulkCreate(stockMovements, opt);

  return true;
}

export async function exportMuebleriaBackup() {
  const [
    measureUnits,
    productCategories,
    brands,
    suppliers,
    storeProducts,
    customers,
    saleOrders,
    saleOrderItems,
    supplierOrders,
    supplierOrderItems,
    stockMovements,
  ] = await Promise.all([
    MeasureUnit.findAll({ raw: true }),
    ProductCategory.findAll({ raw: true }),
    Brand.findAll({ raw: true }),
    Supplier.findAll({ raw: true }),
    StoreProduct.findAll({ raw: true }),
    Customer.findAll({ raw: true }),
    SaleOrder.findAll({ raw: true }),
    SaleOrderItem.findAll({ raw: true }),
    SupplierOrder.findAll({ raw: true }),
    SupplierOrderItem.findAll({ raw: true }),
    StockMovement.findAll({ raw: true }),
  ]);

  return {
    MeasureUnits: measureUnits,
    ProductCategories: productCategories,
    Brands: brands,
    Suppliers: suppliers,
    StoreProducts: storeProducts,
    Customers: customers,
    SaleOrders: saleOrders,
    SaleOrderItems: saleOrderItems,
    SupplierOrders: supplierOrders,
    SupplierOrderItems: supplierOrderItems,
    StockMovements: stockMovements,
  };
}

/** Si no hay productos pero backup.json trae catálogo, lo importa (BD ya existente). */
export async function seedMuebleriaFromBackupIfEmpty() {
  const productCount = await StoreProduct.count();
  if (productCount > 0) return;

  const { readFile } = await import("fs/promises");
  const { resolve, dirname } = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const backupFilePath = resolve(__dirname, "backup.json");

  try {
    const raw = await readFile(backupFilePath, "utf8");
    const jsonData = JSON.parse(raw);
    const { sequelize } = await import("./connection.js");
    const t = await sequelize.transaction();
    try {
      const ok = await applyMuebleriaBackup(jsonData, t);
      await t.commit();
      if (ok) console.log("✅ Datos de negocio cargados desde backup.json (mueblería).");
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (e) {
    if (e.code !== "ENOENT") {
      console.error("❌ Error seed mueblería desde backup:", e.message);
    }
  }
}
