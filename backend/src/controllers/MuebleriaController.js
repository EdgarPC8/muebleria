/**
 * Controlador principal del negocio: catálogo, inventario, clientes, pedidos y tareas.
 */
import { sequelize } from "../database/connection.js";
import { Op, Transaction } from "sequelize";
import {
  Supplier,
  MeasureUnit,
  ProductCategory,
  Brand,
  StoreProduct,
  Purchase,
  PurchaseItem,
  StockMovement,
  FinanceEntry,
  Customer,
  SaleOrder,
  SaleOrderItem,
  SupplierOrder,
  SupplierOrderItem,
  TaskPlan,
  TaskItem,
} from "../models/Muebleria.js";
import { Account } from "../models/Account.js";
import { Users } from "../models/Users.js";
import { Roles } from "../models/Roles.js";
import { Notifications } from "../models/Notifications.js";
import { sendNotificationToUser } from "../sockets/notificationSocket.js";
import {
  normalizeCustomerPayload,
  validateCustomerPayload,
} from "../utils/customerHelpers.js";
import { entityWithMessage } from "../utils/jsonResponse.js";
import { exportDatabaseSchema } from "../utils/databaseSchemaExport.js";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const VALID_TAX_TYPES = new Set(["gravado", "zero", "exento"]);
const to2 = (n) => Number(Number(n || 0).toFixed(2));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const normalizeTaxType = (value) => {
  const t = String(value || "")
    .trim()
    .toLowerCase();
  return VALID_TAX_TYPES.has(t) ? t : "gravado";
};

const normalizeTaxRate = (value, taxType) => {
  const n = Number(value);
  if (taxType !== "gravado") return 0;
  if (!Number.isFinite(n)) return 15;
  return clamp(n, 0, 100);
};

const calculateTaxBreakdown = ({
  quantity = 0,
  unitPrice = 0,
  taxType = "gravado",
  taxRate = 15,
}) => {
  const qty = Number(quantity || 0);
  const price = Number(unitPrice || 0);
  const lineTotal = to2(qty * price);
  if (taxType !== "gravado" || Number(taxRate || 0) <= 0) {
    return { lineTotal, taxBase: lineTotal, taxAmount: 0 };
  }
  const rate = Number(taxRate || 0) / 100;
  const taxBase = to2(lineTotal / (1 + rate));
  const taxAmount = to2(lineTotal - taxBase);
  return { lineTotal, taxBase, taxAmount };
};

export const getSuppliers = async (_req, res) => {
  const data = await Supplier.findAll({ order: [["name", "ASC"]] });
  res.json(data);
};

export const createSupplier = async (req, res) => {
  const created = await Supplier.create(req.body);
  res
    .status(201)
    .json(entityWithMessage(created, "Proveedor guardado correctamente."));
};

export const getUnits = async (_req, res) => {
  const data = await MeasureUnit.findAll({
    order: [
      ["groupName", "ASC"],
      ["factorToBase", "ASC"],
    ],
  });
  res.json(data);
};

export const createUnit = async (req, res) => {
  const { name, abbreviation, groupName, factorToBase, isBase } = req.body;
  if (!name?.trim() || !abbreviation?.trim() || !groupName?.trim()) {
    return res
      .status(400)
      .json({ message: "Nombre, abreviatura y grupo son requeridos." });
  }
  const f = Number(factorToBase);
  if (!Number.isFinite(f) || f <= 0) {
    return res
      .status(400)
      .json({ message: "factorToBase debe ser un número mayor que 0." });
  }
  try {
    const created = await MeasureUnit.create({
      name: name.trim(),
      abbreviation: abbreviation.trim(),
      groupName: groupName.trim(),
      factorToBase: f,
      isBase: Boolean(isBase),
    });
    res
      .status(201)
      .json(
        entityWithMessage(created, "Unidad de medida guardada correctamente."),
      );
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Ya existe una unidad con ese nombre." });
    }
    throw e;
  }
};

export const getCategories = async (_req, res) => {
  const data = await ProductCategory.findAll({
    include: [
      {
        model: ProductCategory,
        as: "parent",
        attributes: ["id", "name", "slug"],
      },
    ],
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });
  res.json(data);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const category = await ProductCategory.findByPk(id);
  if (!category)
    return res.status(404).json({ message: "Categoría no encontrada." });

  const { name, description, parentId, sortOrder } = req.body;

  let slug = category.slug;
  if (name?.trim() && name.trim() !== category.name) {
    const slugBase = slugify(name);
    if (!slugBase)
      return res.status(400).json({ message: "No se pudo generar slug válido." });
    slug = slugBase;
    let i = 1;
    while (await ProductCategory.findOne({ where: { slug, id: { [Op.ne]: id } } })) {
      i += 1;
      slug = `${slugBase}-${i}`;
    }
  }

  if (parentId && Number(parentId) === Number(id)) {
    return res.status(400).json({ message: "Una categoría no puede ser padre de sí misma." });
  }
  if (parentId) {
    const parent = await ProductCategory.findByPk(parentId);
    if (!parent)
      return res.status(400).json({ message: "La categoría padre no existe." });
  }

  await category.update({
    name: name?.trim() || category.name,
    slug,
    parentId: parentId !== undefined ? (parentId || null) : category.parentId,
    description: description !== undefined ? (description?.trim() || null) : category.description,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : category.sortOrder,
  });
  await category.reload();
  res.json(entityWithMessage(category, "Categoría actualizada correctamente."));
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await ProductCategory.findByPk(id);
  if (!category)
    return res.status(404).json({ message: "Categoría no encontrada." });

  await category.update({ isActive: false });
  res.json({ message: "Categoría desactivada correctamente." });
};

export const getBrands = async (_req, res) => {
  const data = await Brand.findAll({ order: [["name", "ASC"]] });
  res.json(data);
};

export const createBrand = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res
      .status(400)
      .json({ message: "El nombre de marca es requerido." });
  }
  const created = await Brand.create({ name: name.trim() });
  res
    .status(201)
    .json(entityWithMessage(created, "Marca creada correctamente."));
};

export const createCategory = async (req, res) => {
  const {
    name,
    description,
    parentId = null,
    isActive = true,
    sortOrder = 0,
  } = req.body;
  if (!name?.trim()) {
    return res
      .status(400)
      .json({ message: "El nombre de categoría es requerido." });
  }

  if (parentId) {
    const parent = await ProductCategory.findByPk(parentId);
    if (!parent) {
      return res.status(400).json({ message: "La categoría padre no existe." });
    }
  }

  const slugBase = slugify(name);
  if (!slugBase) {
    return res.status(400).json({ message: "No se pudo generar slug válido." });
  }

  let slug = slugBase;
  let i = 1;
  // Garantiza slug único sin romper por nombre repetido
  while (await ProductCategory.findOne({ where: { slug } })) {
    i += 1;
    slug = `${slugBase}-${i}`;
  }

  const created = await ProductCategory.create({
    name: name.trim(),
    slug,
    parentId: parentId || null,
    description: description?.trim() || null,
    isActive: Boolean(isActive),
    sortOrder: Number(sortOrder || 0),
  });
  res
    .status(201)
    .json(entityWithMessage(created, "Categoría creada correctamente."));
};

export const getProducts = async (_req, res) => {
  const data = await StoreProduct.findAll({
    include: [
      { model: ProductCategory, as: "category" },
      { model: Brand, as: "brand" },
      { model: MeasureUnit, as: "baseUnit" },
    ],
    order: [["name", "ASC"]],
  });
  res.json(data);
};

export const createProduct = async (req, res) => {
  const taxType = normalizeTaxType(req.body.taxType);
  const taxRate = normalizeTaxRate(req.body.taxRate, taxType);
  const created = await StoreProduct.create({
    ...req.body,
    brandId: req.body.brandId || null,
    sizeLabel: req.body.sizeLabel?.trim() || null,
    taxType,
    taxRate,
    primaryImageUrl: req.uploadInfo?.relPath || null,
    wholesaleMinQty: Number(req.body.wholesaleMinQty || 0),
    wholesalePrice: Number(req.body.wholesalePrice || 0),
  });
  res
    .status(201)
    .json(entityWithMessage(created, "Producto creado correctamente."));
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await StoreProduct.findByPk(id);

  if (!product)
    return res.status(404).json({ message: "Producto no encontrado." });

  const taxType = normalizeTaxType(req.body.taxType ?? product.taxType);
  const taxRate = normalizeTaxRate(
    req.body.taxRate ?? product.taxRate,
    taxType,
  );
  const payload = {
    name: req.body.name?.trim() || product.name,
    sku: req.body.sku?.trim() || null,
    barcode: req.body.barcode?.trim() || null,
    categoryId: req.body.categoryId ? Number(req.body.categoryId) : null,
    brandId: req.body.brandId ? Number(req.body.brandId) : null,
    baseUnitId: req.body.baseUnitId
      ? Number(req.body.baseUnitId)
      : product.baseUnitId,
    sizeLabel: req.body.sizeLabel?.trim() || null,
    stockBase: req.body.stockBase,
    salePrice: Number(req.body.salePrice ?? product.salePrice ?? 0),
    taxType,
    taxRate,
    wholesaleMinQty: Number(
      req.body.wholesaleMinQty ?? product.wholesaleMinQty ?? 0,
    ),
    wholesalePrice: Number(
      req.body.wholesalePrice ?? product.wholesalePrice ?? 0,
    ),

    minStockBase: Number(req.body.minStockBase ?? product.minStockBase ?? 0),
  };

  if (req.uploadInfo?.relPath && product.primaryImageUrl) {
    payload.primaryImageUrl = req.uploadInfo.relPath;
    await fs.unlink(path.join(__dirname, "..", "img", product.primaryImageUrl));
  } else {
    payload.primaryImageUrl = req.uploadInfo.relPath;
  }

  await product.update(payload);
  await product.reload();
  res.json(entityWithMessage(product, "Producto actualizado correctamente."));
};

/**
 * Registrar compra y actualizar stock/costo promedio en unidad base.
 * Body esperado:
 * {
 *   supplierId, date, invoiceNumber?, note?,
 *   items: [{ productId, unitId, quantity, unitPrice }]
 * }
 */
export const createPurchase = async (req, res) => {
  const { supplierId, date, invoiceNumber, note, items = [] } = req.body;
  if (!supplierId || !date || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "supplierId, date e items son requeridos." });
  }

  const t = await sequelize.transaction();
  try {
    let purchaseTotal = 0;
    const purchase = await Purchase.create(
      { supplierId, date, invoiceNumber, note, total: 0 },
      { transaction: t },
    );

    for (const item of items) {
      const { productId, unitId, quantity, unitPrice } = item;
      if (!productId || !unitId || !quantity || !unitPrice) {
        throw new Error(
          "Cada item requiere productId, unitId, quantity y unitPrice.",
        );
      }

      const product = await StoreProduct.findByPk(productId, {
        transaction: t,
      });
      const purchaseUnit = await MeasureUnit.findByPk(unitId, {
        transaction: t,
      });
      const baseUnit = await MeasureUnit.findByPk(product.baseUnitId, {
        transaction: t,
      });
      if (!product || !purchaseUnit || !baseUnit) {
        throw new Error("Producto o unidad no encontrada.");
      }
      if (purchaseUnit.groupName !== baseUnit.groupName) {
        throw new Error(
          `Unidad ${purchaseUnit.name} no compatible con base ${baseUnit.name}.`,
        );
      }

      // Conversión: cantidad comprada -> cantidad base
      const quantityBase =
        (Number(quantity) * Number(purchaseUnit.factorToBase)) /
        Number(baseUnit.factorToBase);
      const lineTotal = Number(quantity) * Number(unitPrice);
      purchaseTotal += lineTotal;

      await PurchaseItem.create(
        {
          purchaseId: purchase.id,
          productId,
          unitId,
          quantity,
          quantityBase,
          expiryDate: item.expiryDate || null,
          unitPrice,
          lineTotal,
        },
        { transaction: t },
      );

      // Costo promedio ponderado
      const currentStock = Number(product.stockBase || 0);
      const currentAvg = Number(product.avgCostBase || 0);
      const incomingCostBase = lineTotal / quantityBase;
      const newStock = currentStock + quantityBase;
      const newAvg =
        newStock > 0
          ? (currentStock * currentAvg + quantityBase * incomingCostBase) /
            newStock
          : incomingCostBase;

      await product.update(
        { stockBase: newStock, avgCostBase: newAvg },
        { transaction: t },
      );

      await StockMovement.create(
        {
          productId,
          type: "entrada_compra",
          quantityBase,
          unitCostBase: incomingCostBase,
          referenceType: "purchase",
          referenceId: purchase.id,
          note: `Compra ${invoiceNumber || purchase.id}`,
        },
        { transaction: t },
      );
    }

    await purchase.update({ total: purchaseTotal }, { transaction: t });
    await t.commit();
    res
      .status(201)
      .json({ ok: true, purchaseId: purchase.id, total: purchaseTotal });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const getPurchases = async (_req, res) => {
  const data = await Purchase.findAll({
    include: [
      { model: Supplier, as: "supplier" },
      {
        model: PurchaseItem,
        include: [
          { model: StoreProduct, as: "product" },
          { model: MeasureUnit, as: "unit" },
        ],
      },
    ],
    order: [["id", "DESC"]],
  });
  res.json(data);
};

export const getStockMovements = async (_req, res) => {
  const data = await StockMovement.findAll({
    include: [{ model: StoreProduct, as: "product" }],
    order: [["id", "DESC"]],
    limit: 500,
  });
  res.json(data);
};

export const getFinanceEntries = async (_req, res) => {
  const data = await FinanceEntry.findAll({
    order: [
      ["date", "DESC"],
      ["id", "DESC"],
    ],
  });
  res.json(data);
};

export const createFinanceEntry = async (req, res) => {
  const { type, date, amount, category, description } = req.body;
  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "type debe ser income o expense." });
  }
  if (!date) return res.status(400).json({ message: "date es requerido." });
  const a = Number(amount || 0);
  if (a <= 0)
    return res.status(400).json({ message: "amount debe ser mayor que 0." });
  const created = await FinanceEntry.create({
    type,
    date,
    amount: a,
    category: category?.trim() || null,
    description: description?.trim() || null,
    sourceType: "manual",
  });
  res.status(201).json(created);
};

const saleOrderTotal = (order) =>
  (order.muebleria_order_items || []).reduce(
    (acc, item) =>
      acc +
      Number(
        item.lineTotal ?? Number(item.quantity || 0) * Number(item.price || 0),
      ),
    0,
  );

const supplierOrderTotal = (order) =>
  (order.muebleria_supplier_order_items || []).reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );

const buildDailySeries = (entries, dayCount = 14) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys = [];
  const labels = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    keys.push(key);
    labels.push(
      d.toLocaleDateString("es-EC", { weekday: "short", day: "numeric" }),
    );
  }
  const incomeMap = new Map(keys.map((k) => [k, 0]));
  const expenseMap = new Map(keys.map((k) => [k, 0]));
  for (const row of entries) {
    const key = String(row.date || "").slice(0, 10);
    if (!incomeMap.has(key)) continue;
    if (row.kind === "income")
      incomeMap.set(key, (incomeMap.get(key) || 0) + Number(row.amount || 0));
    if (row.kind === "expense")
      expenseMap.set(key, (expenseMap.get(key) || 0) + Number(row.amount || 0));
  }
  return {
    labels,
    income: keys.map((k) => Number((incomeMap.get(k) || 0).toFixed(2))),
    expense: keys.map((k) => Number((expenseMap.get(k) || 0).toFixed(2))),
  };
};

export const getFinanceSummary = async (req, res) => {
  const from = req.query.from || null;
  const to = req.query.to || null;
  const dateWhere = {};
  if (from) dateWhere[Op.gte] = from;
  if (to) dateWhere[Op.lte] = to;
  const hasRange = Object.keys(dateWhere).length > 0;
  const orderDateWhere = hasRange
    ? { [Op.gte]: from || "1900-01-01", [Op.lte]: to || "2999-12-31T23:59:59" }
    : undefined;

  const [
    manualEntries,
    purchases,
    orders,
    supplierOrders,
    allOrdersPending,
    allSupplierPending,
  ] = await Promise.all([
    FinanceEntry.findAll({
      where: hasRange ? { date: dateWhere } : undefined,
      raw: true,
    }),
    Purchase.findAll({
      where: hasRange ? { date: dateWhere } : undefined,
      raw: true,
    }),
    SaleOrder.findAll({
      where: orderDateWhere ? { date: orderDateWhere } : undefined,
      include: [
        {
          model: SaleOrderItem,
          attributes: ["quantity", "price", "lineTotal"],
        },
      ],
    }),
    SupplierOrder.findAll({
      where: orderDateWhere ? { date: orderDateWhere } : undefined,
      include: [
        { model: SupplierOrderItem, attributes: ["quantity", "unitPrice"] },
      ],
    }),
    SaleOrder.findAll({
      where: { paidAt: null },
      include: [
        {
          model: SaleOrderItem,
          attributes: ["quantity", "price", "lineTotal"],
        },
      ],
    }),
    SupplierOrder.findAll({
      where: { paidAt: null },
      include: [
        { model: SupplierOrderItem, attributes: ["quantity", "unitPrice"] },
      ],
    }),
  ]);

  const manualIncome = manualEntries
    .filter((e) => e.type === "income")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const manualExpense = manualEntries
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const purchasesExpense = purchases.reduce(
    (acc, p) => acc + Number(p.total || 0),
    0,
  );
  const salesIncome = orders.reduce((acc, o) => acc + saleOrderTotal(o), 0);
  const supplierOrdersExpense = supplierOrders.reduce(
    (acc, o) => acc + supplierOrderTotal(o),
    0,
  );

  const totalIncome = manualIncome + salesIncome;
  const totalExpense = manualExpense + purchasesExpense + supplierOrdersExpense;

  const expectedCash = allOrdersPending.reduce(
    (acc, o) => acc + saleOrderTotal(o),
    0,
  );
  const debts = allSupplierPending.reduce(
    (acc, o) => acc + supplierOrderTotal(o),
    0,
  );

  const dailyRows = [];
  for (const o of orders) {
    const key = String(o.date || o.createdAt || "").slice(0, 10);
    dailyRows.push({ date: key, kind: "income", amount: saleOrderTotal(o) });
  }
  for (const e of manualEntries.filter((x) => x.type === "income")) {
    dailyRows.push({ date: e.date, kind: "income", amount: e.amount });
  }
  for (const p of purchases) {
    dailyRows.push({ date: p.date, kind: "expense", amount: p.total });
  }
  for (const o of supplierOrders) {
    const key = String(o.date || o.createdAt || "").slice(0, 10);
    dailyRows.push({
      date: key,
      kind: "expense",
      amount: supplierOrderTotal(o),
    });
  }
  for (const e of manualEntries.filter((x) => x.type === "expense")) {
    dailyRows.push({ date: e.date, kind: "expense", amount: e.amount });
  }

  res.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expectedCash,
    debts,
    breakdown: {
      salesIncome,
      manualIncome,
      purchasesExpense,
      manualExpense,
      supplierOrdersExpense,
    },
    dailySeries: buildDailySeries(dailyRows),
  });
};

/** Estructura de tablas y relaciones (modelos Sequelize) para diagrama en frontend. */
export const getDatabaseSchema = async (_req, res) => {
  try {
    res.json(exportDatabaseSchema());
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "No se pudo exportar el esquema." });
  }
};

/** Conteos del negocio para el panel principal (gráfica de panorama). */
export const getDashboardStats = async (_req, res) => {
  const [
    categories,
    products,
    customers,
    suppliers,
    customerOrders,
    supplierOrders,
    brands,
    movements,
  ] = await Promise.all([
    ProductCategory.count(),
    StoreProduct.count(),
    Customer.count(),
    Supplier.count(),
    SaleOrder.count(),
    SupplierOrder.count(),
    Brand.count(),
    StockMovement.count(),
  ]);

  res.json({
    categories,
    products,
    customers,
    suppliers,
    customerOrders,
    supplierOrders,
    brands,
    movements,
  });
};

export const openProductBoxes = async (req, res) => {
  const {
    boxProductId,
    unitProductId,
    unitsPerBox,
    boxesToOpen = 1,
  } = req.body;
  const units = Number(unitsPerBox || 0);
  const boxes = Number(boxesToOpen || 0);
  if (!boxProductId || !unitProductId || units <= 0 || boxes <= 0) {
    return res.status(400).json({
      message:
        "boxProductId, unitProductId, unitsPerBox y boxesToOpen son requeridos.",
    });
  }

  const t = await sequelize.transaction();
  try {
    const boxProduct = await StoreProduct.findByPk(Number(boxProductId), {
      transaction: t,
    });
    const unitProduct = await StoreProduct.findByPk(Number(unitProductId), {
      transaction: t,
    });
    if (!boxProduct || !unitProduct)
      throw new Error("Producto caja o unidad no encontrado.");
    if (Number(boxProduct.stockBase || 0) < boxes)
      throw new Error("No hay cajas suficientes para abrir.");

    const unitQty = boxes * units;
    await boxProduct.update(
      { stockBase: Number(boxProduct.stockBase || 0) - boxes },
      { transaction: t },
    );
    await unitProduct.update(
      { stockBase: Number(unitProduct.stockBase || 0) + unitQty },
      { transaction: t },
    );

    await StockMovement.create(
      {
        productId: boxProduct.id,
        type: "ajuste_salida",
        quantityBase: boxes,
        unitCostBase: Number(boxProduct.avgCostBase || 0),
        referenceType: "open_box",
        referenceId: unitProduct.id,
        note: `Abrir ${boxes} caja(s) -> ${unitQty} unidad(es) de ${unitProduct.name}`,
      },
      { transaction: t },
    );
    await StockMovement.create(
      {
        productId: unitProduct.id,
        type: "ajuste_entrada",
        quantityBase: unitQty,
        unitCostBase: Number(unitProduct.avgCostBase || 0),
        referenceType: "open_box",
        referenceId: boxProduct.id,
        note: `Ingreso por abrir ${boxes} caja(s) de ${boxProduct.name}`,
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({
      ok: true,
      boxProductId: boxProduct.id,
      unitProductId: unitProduct.id,
      boxesOpened: boxes,
      unitsAdded: unitQty,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const getExpiryAlerts = async (req, res) => {
  const days = Math.max(1, Number(req.query.days || 30));
  const today = new Date();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + days);

  const rows = await PurchaseItem.findAll({
    where: {
      expiryDate: {
        [Op.not]: null,
        [Op.lte]: limitDate,
      },
    },
    include: [
      {
        model: StoreProduct,
        as: "product",
        attributes: ["id", "name", "sizeLabel"],
      },
    ],
    order: [["expiryDate", "ASC"]],
  });

  const data = rows.map((r) => {
    const d = new Date(r.expiryDate);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    return {
      id: r.id,
      productId: r.productId,
      productName: r.product?.name || "—",
      sizeLabel: r.product?.sizeLabel || null,
      expiryDate: r.expiryDate,
      quantityBase: Number(r.quantityBase || 0),
      status: diffDays < 0 ? "vencido" : diffDays <= 7 ? "critico" : "proximo",
      remainingDays: diffDays,
    };
  });
  res.json(data);
};

export const getCustomers = async (_req, res) => {
  const data = await Customer.findAll({
    where: { isActive: true },
    order: [
      ["firstName", "ASC"],
      ["firstLastName", "ASC"],
      ["name", "ASC"],
    ],
  });
  res.json(data);
};

export const createCustomer = async (req, res) => {
  try {
    const payload = normalizeCustomerPayload(req.body);
    const err = validateCustomerPayload(payload);
    if (err) return res.status(400).json({ message: err });

    const created = await Customer.create(payload);
    res
      .status(201)
      .json(entityWithMessage(created, "Cliente creado correctamente."));
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Ya existe un cliente con ese documento." });
    }
    res
      .status(500)
      .json({ message: error.message || "Error al crear cliente." });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    if (!customer)
      return res.status(404).json({ message: "Cliente no encontrado." });

    const payload = normalizeCustomerPayload({
      ...customer.toJSON(),
      ...req.body,
    });
    const allowLegacy =
      !customer.firstName && !customer.firstLastName && Boolean(customer.name);
    const err = validateCustomerPayload(payload, { allowLegacy });
    if (err) return res.status(400).json({ message: err });

    await customer.update(payload);
    await customer.reload();
    res.json(entityWithMessage(customer, "Cliente actualizado correctamente."));
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Ya existe un cliente con ese documento." });
    }
    res
      .status(500)
      .json({ message: error.message || "Error al actualizar cliente." });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    if (!customer)
      return res.status(404).json({ message: "Cliente no encontrado." });
    await customer.update({ isActive: false });
    res.json({ message: "Cliente desactivado correctamente." });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error al desactivar cliente." });
  }
};

export const getOrders = async (_req, res) => {
  const data = await SaleOrder.findAll({
    include: [
      { model: Customer, as: "customer" },
      {
        model: SaleOrderItem,
        include: [{ model: StoreProduct, as: "product" }],
      },
    ],
    order: [["date", "DESC"]],
  });
  res.json(data);
};

export const createOrder = async (req, res) => {
  const { customerId, date, notes, items = [] } = req.body;
  if (!customerId || !date || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "customerId, date e items son requeridos." });
  }
  const t = await sequelize.transaction();
  try {
    const order = await SaleOrder.create(
      {
        customerId,
        date: new Date(date),
        notes: notes || null,
        status: "pendiente",
        receivedAt: null,
        paidAt: null,
        paymentMethod: null,
      },
      { transaction: t },
    );
    for (const row of items) {
      const product = await StoreProduct.findByPk(row.productId, {
        transaction: t,
      });
      if (!product) throw new Error("Producto no encontrado.");
      const qty = Number(row.quantity || 0);
      if (qty <= 0) throw new Error("Cantidad inválida.");
      const wholesaleMin = Number(product.wholesaleMinQty || 0);
      const defaultPrice =
        wholesaleMin > 0 && qty >= wholesaleMin
          ? Number(product.wholesalePrice || product.salePrice || 0)
          : Number(product.salePrice || 0);
      const price = Number(row.price || defaultPrice);
      const taxType = normalizeTaxType(product.taxType);
      const taxRate = normalizeTaxRate(product.taxRate, taxType);
      const breakdown = calculateTaxBreakdown({
        quantity: qty,
        unitPrice: price,
        taxType,
        taxRate,
      });
      await SaleOrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          price,
          taxType,
          taxRate,
          taxBase: breakdown.taxBase,
          taxAmount: breakdown.taxAmount,
          lineTotal: breakdown.lineTotal,
          deliveredAt: null,
          paidAt: null,
        },
        { transaction: t },
      );
    }
    await t.commit();
    res.status(201).json({ ok: true, orderId: order.id });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const {
    customerId,
    date,
    notes,
    status,
    receivedAt,
    paidAt,
    paymentMethod,
    items,
  } = req.body;
  const order = await SaleOrder.findByPk(id);
  if (!order) return res.status(404).json({ message: "Pedido no encontrado." });
  if (!customerId || !date) {
    return res
      .status(400)
      .json({ message: "customerId y date son requeridos." });
  }
  const t = await sequelize.transaction();
  try {
    const wasReceived = Boolean(order.receivedAt);
    const nextReceivedAt = receivedAt ? new Date(receivedAt) : order.receivedAt;

    await order.update(
      {
        customerId: Number(customerId),
        date: new Date(date),
        notes: notes || null,
        status: status || order.status,
        receivedAt: receivedAt ? new Date(receivedAt) : order.receivedAt,
        paidAt: paidAt ? new Date(paidAt) : order.paidAt,
        paymentMethod: paymentMethod || order.paymentMethod || null,
      },
      { transaction: t },
    );

    if (Array.isArray(items)) {
      await SaleOrderItem.destroy({
        where: { orderId: order.id },
        transaction: t,
      });
      for (const row of items) {
        const product = await StoreProduct.findByPk(Number(row.productId), {
          transaction: t,
        });
        if (!product) throw new Error("Producto no encontrado.");
        const qty = Number(row.quantity || 0);
        if (qty <= 0) throw new Error("Cantidad inválida.");
        const wholesaleMin = Number(product.wholesaleMinQty || 0);
        const defaultPrice =
          wholesaleMin > 0 && qty >= wholesaleMin
            ? Number(product.wholesalePrice || product.salePrice || 0)
            : Number(product.salePrice || 0);
        const price = Number(row.price || defaultPrice);
        const taxType = normalizeTaxType(product.taxType);
        const taxRate = normalizeTaxRate(product.taxRate, taxType);
        const breakdown = calculateTaxBreakdown({
          quantity: qty,
          unitPrice: price,
          taxType,
          taxRate,
        });
        await SaleOrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            quantity: qty,
            price,
            taxType,
            taxRate,
            taxBase: breakdown.taxBase,
            taxAmount: breakdown.taxAmount,
            lineTotal: breakdown.lineTotal,
            deliveredAt: null,
            paidAt: null,
          },
          { transaction: t },
        );
      }
    }

    // Cuando un pedido cliente se marca como recibido/entregado por primera vez, descuenta inventario.
    if (!wasReceived && Boolean(nextReceivedAt)) {
      const notesForTag = String(notes ?? order.notes ?? "");
      const fromCajaPos = notesForTag.includes("[CAJA_POS]");
      const orderItems = await SaleOrderItem.findAll({
        where: { orderId: order.id },
        transaction: t,
      });
      for (const item of orderItems) {
        const product = await StoreProduct.findByPk(Number(item.productId), {
          transaction: t,
        });
        if (!product)
          throw new Error("Producto no encontrado para descontar inventario.");
        const qty = Number(item.quantity || 0);
        const currentStock = Number(product.stockBase || 0);
        if (qty <= 0) continue;
        if (currentStock < qty) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${currentStock}, requerido: ${qty}.`,
          );
        }
        await product.update(
          { stockBase: currentStock - qty },
          { transaction: t },
        );
        await StockMovement.create(
          {
            productId: product.id,
            type: "salida_venta",
            quantityBase: qty,
            unitCostBase: Number(product.avgCostBase || 0),
            referenceType: "sale_order_delivered",
            referenceId: order.id,
            note: fromCajaPos
              ? `Salida venta caja · pedido #${order.id}`
              : `Salida por entrega de pedido cliente #${order.id}`,
          },
          { transaction: t },
        );
        await item.update({ deliveredAt: nextReceivedAt }, { transaction: t });
      }
    }

    await t.commit();
    res.json(order);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const getSupplierOrders = async (_req, res) => {
  const data = await SupplierOrder.findAll({
    include: [
      { model: Supplier, as: "supplier" },
      {
        model: SupplierOrderItem,
        include: [{ model: StoreProduct, as: "product" }],
      },
    ],
    order: [["date", "DESC"]],
  });
  res.json(data);
};

export const createSupplierOrder = async (req, res) => {
  const { supplierId, date, notes, items = [] } = req.body;
  if (!supplierId || !date || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "supplierId, date e items son requeridos." });
  }
  const t = await sequelize.transaction();
  try {
    const order = await SupplierOrder.create(
      {
        supplierId,
        date: new Date(date),
        notes: notes || null,
        status: "pendiente",
        receivedAt: null,
        paidAt: null,
        paymentMethod: null,
      },
      { transaction: t },
    );
    for (const row of items) {
      if (!row.productId || Number(row.quantity || 0) <= 0)
        throw new Error("Item inválido.");
      await SupplierOrderItem.create(
        {
          orderId: order.id,
          productId: Number(row.productId),
          quantity: Number(row.quantity),
          unitPrice: Number(row.unitPrice || 0),
        },
        { transaction: t },
      );
    }
    await t.commit();
    res.status(201).json({ ok: true, orderId: order.id });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const updateSupplierOrder = async (req, res) => {
  const { id } = req.params;
  const {
    supplierId,
    date,
    notes,
    status,
    receivedAt,
    paidAt,
    paymentMethod,
    items,
  } = req.body;
  const order = await SupplierOrder.findByPk(id);
  if (!order)
    return res.status(404).json({ message: "Pedido proveedor no encontrado." });
  const t = await sequelize.transaction();
  try {
    const wasReceived = Boolean(order.receivedAt);
    const nextReceivedAt = receivedAt ? new Date(receivedAt) : order.receivedAt;

    await order.update(
      {
        supplierId: Number(supplierId || order.supplierId),
        date: date ? new Date(date) : order.date,
        notes: notes ?? order.notes,
        status: status || order.status,
        receivedAt: receivedAt ? new Date(receivedAt) : order.receivedAt,
        paidAt: paidAt ? new Date(paidAt) : order.paidAt,
        paymentMethod: paymentMethod || order.paymentMethod || null,
      },
      { transaction: t },
    );

    if (Array.isArray(items)) {
      await SupplierOrderItem.destroy({
        where: { orderId: order.id },
        transaction: t,
      });
      for (const row of items) {
        if (!row.productId || Number(row.quantity || 0) <= 0)
          throw new Error("Item inválido.");
        await SupplierOrderItem.create(
          {
            orderId: order.id,
            productId: Number(row.productId),
            quantity: Number(row.quantity),
            unitPrice: Number(row.unitPrice || 0),
          },
          { transaction: t },
        );
      }
    }

    // Cuando un pedido proveedor se marca como recibido por primera vez, ingresa inventario.
    if (!wasReceived && Boolean(nextReceivedAt)) {
      const orderItems = await SupplierOrderItem.findAll({
        where: { orderId: order.id },
        transaction: t,
      });
      for (const item of orderItems) {
        const product = await StoreProduct.findByPk(Number(item.productId), {
          transaction: t,
        });
        if (!product)
          throw new Error("Producto no encontrado para ingresar inventario.");
        const qty = Number(item.quantity || 0);
        if (qty <= 0) continue;
        const currentStock = Number(product.stockBase || 0);
        await product.update(
          { stockBase: currentStock + qty },
          { transaction: t },
        );
        await StockMovement.create(
          {
            productId: product.id,
            type: "ajuste_entrada",
            quantityBase: qty,
            unitCostBase: Number(product.avgCostBase || 0),
            referenceType: "supplier_order_received",
            referenceId: order.id,
            note: `Ingreso por recepción de pedido proveedor #${order.id}`,
          },
          { transaction: t },
        );
      }
    }

    await t.commit();
    res.json(order);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

/**
 * Ajuste desde caja: entrada (físico > sistema) o salida (sistema > físico: merma, robo, error).
 * kind: "entrada" | "salida". flagForReview añade [POS_REVISAR] en la nota.
 */
export const createStockAdjustment = async (req, res) => {
  const {
    productId,
    quantityBase,
    note,
    flagForReview,
    kind = "entrada",
  } = req.body;
  const pid = Number(productId);
  const qty = Number(quantityBase);
  const isSalida = String(kind).toLowerCase() === "salida";
  if (!Number.isFinite(pid) || pid <= 0) {
    return res.status(400).json({ message: "productId inválido." });
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return res
      .status(400)
      .json({ message: "quantityBase debe ser mayor a 0." });
  }
  const t = await sequelize.transaction();
  try {
    const product = await StoreProduct.findByPk(pid, {
      transaction: t,
      lock: Transaction.LOCK.UPDATE,
    });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    const currentStock = Number(product.stockBase || 0);
    const prefix = flagForReview ? "[POS_REVISAR] " : "";
    const extra =
      typeof note === "string" && note.trim()
        ? ` · ${note.trim().slice(0, 400)}`
        : "";

    let newStock;
    let movementType;
    let noteBody;
    if (isSalida) {
      if (currentStock < qty) {
        await t.rollback();
        return res.status(400).json({
          message: `No puedes bajar ${qty}: en sistema hay ${currentStock} (unidad base).`,
        });
      }
      newStock = currentStock - qty;
      movementType = "ajuste_salida";
      noteBody = `${prefix}Ajuste salida caja / sistema > físico${extra}`;
    } else {
      newStock = currentStock + qty;
      movementType = "ajuste_entrada";
      noteBody = `${prefix}Ajuste entrada caja / físico > sistema${extra}`;
    }

    await product.update({ stockBase: newStock }, { transaction: t });
    await StockMovement.create(
      {
        productId: pid,
        type: movementType,
        quantityBase: qty,
        unitCostBase: Number(product.avgCostBase || 0),
        referenceType: "pos_adjustment",
        referenceId: null,
        note: noteBody.slice(0, 65000),
      },
      { transaction: t },
    );
    await t.commit();
    res.status(201).json({
      ok: true,
      productId: pid,
      kind: isSalida ? "salida" : "entrada",
      stockBaseBefore: currentStock,
      stockBaseAfter: newStock,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

const ADMIN_ROLES = new Set(["Administrador", "Programador"]);
const TASK_STATUS_PRIORITY = {
  pending: 0,
  in_progress: 1,
  blocked: 2,
  done: 3,
};

const isAdminRole = (req) => ADMIN_ROLES.has(String(req?.user?.loginRol || ""));
const todayISO = () => new Date().toISOString().slice(0, 10);

const parseActionPayload = (item) => {
  if (!item?.actionPayload) return null;
  try {
    return JSON.parse(item.actionPayload);
  } catch {
    return null;
  }
};

async function openBoxForTaskPayload(payload, t, taskItemId) {
  const boxProductId = Number(payload?.boxProductId);
  const unitProductId = Number(payload?.unitProductId);
  const unitsPerBox = Number(payload?.unitsPerBox || 0);
  const boxesToOpen = Number(payload?.boxesToOpen || 1);
  if (!boxProductId || !unitProductId || unitsPerBox <= 0 || boxesToOpen <= 0) {
    throw new Error("La tarea no tiene un payload válido para abrir caja.");
  }
  const boxProduct = await StoreProduct.findByPk(boxProductId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  const unitProduct = await StoreProduct.findByPk(unitProductId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!boxProduct || !unitProduct)
    throw new Error("Producto caja o unidad no encontrado.");
  if (Number(boxProduct.stockBase || 0) < boxesToOpen)
    throw new Error("No hay cajas suficientes para abrir.");

  const unitQty = boxesToOpen * unitsPerBox;
  await boxProduct.update(
    { stockBase: Number(boxProduct.stockBase || 0) - boxesToOpen },
    { transaction: t },
  );
  await unitProduct.update(
    { stockBase: Number(unitProduct.stockBase || 0) + unitQty },
    { transaction: t },
  );

  await StockMovement.create(
    {
      productId: boxProduct.id,
      type: "ajuste_salida",
      quantityBase: boxesToOpen,
      unitCostBase: Number(boxProduct.avgCostBase || 0),
      referenceType: "task_open_box",
      referenceId: taskItemId,
      note: `[TAREA] Abrir ${boxesToOpen} caja(s) -> ${unitQty} unidad(es) de ${unitProduct.name}`,
    },
    { transaction: t },
  );
  await StockMovement.create(
    {
      productId: unitProduct.id,
      type: "ajuste_entrada",
      quantityBase: unitQty,
      unitCostBase: Number(unitProduct.avgCostBase || 0),
      referenceType: "task_open_box",
      referenceId: taskItemId,
      note: `[TAREA] Ingreso por abrir ${boxesToOpen} caja(s) de ${boxProduct.name}`,
    },
    { transaction: t },
  );
  return { boxesOpened: boxesToOpen, unitsAdded: unitQty };
}

export const getTaskAssignees = async (req, res) => {
  if (!isAdminRole(req))
    return res.status(403).json({ message: "No autorizado." });
  const rows = await Account.findAll({
    include: [
      {
        model: Users,
        as: "user",
        attributes: [
          "id",
          "firstName",
          "secondName",
          "firstLastName",
          "secondLastName",
        ],
      },
      {
        model: Roles,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
    order: [["id", "ASC"]],
  });
  const data = rows.map((a) => {
    const u = a.user || {};
    const fullName = [
      u.firstName,
      u.secondName,
      u.firstLastName,
      u.secondLastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      accountId: a.id,
      userId: a.userId,
      username: a.username,
      fullName: fullName || a.username || `Usuario ${a.userId}`,
      roles: (a.roles || []).map((r) => r.name),
    };
  });
  res.json(data);
};

export const createTaskPlan = async (req, res) => {
  if (!isAdminRole(req))
    return res.status(403).json({ message: "No autorizado." });
  const { title, description, startDate, endDate, items = [] } = req.body;
  if (!title?.trim() || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "title, startDate y endDate son requeridos." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Debes agregar al menos una tarea." });
  }
  const t = await sequelize.transaction();
  try {
    const plan = await TaskPlan.create(
      {
        title: title.trim(),
        description: description?.trim() || null,
        startDate,
        endDate,
        status: "draft",
        createdByUserId: Number(req.user?.userId || 0),
      },
      { transaction: t },
    );
    for (const [idx, row] of items.entries()) {
      const assignedUserId = Number(row.assignedUserId || 0);
      if (!row?.title?.trim() || !assignedUserId) {
        throw new Error(
          `La tarea #${idx + 1} requiere título y usuario asignado.`,
        );
      }
      const payload =
        row.actionPayload && typeof row.actionPayload === "object"
          ? row.actionPayload
          : null;
      await TaskItem.create(
        {
          planId: plan.id,
          title: row.title.trim(),
          description: row.description?.trim() || null,
          assignedUserId,
          status: "pending",
          priority: Number(row.priority || idx || 0),
          dueDate: row.dueDate || null,
          actionType: row.actionType === "open_box" ? "open_box" : "none",
          actionPayload: payload ? JSON.stringify(payload) : null,
        },
        { transaction: t },
      );
    }
    await t.commit();
    res.status(201).json({ ok: true, planId: plan.id });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const publishTaskPlan = async (req, res) => {
  if (!isAdminRole(req))
    return res.status(403).json({ message: "No autorizado." });
  const { id } = req.params;
  const plan = await TaskPlan.findByPk(id, {
    include: [{ model: TaskItem, as: "items" }],
  });
  if (!plan) return res.status(404).json({ message: "Plan no encontrado." });
  if ((plan.items || []).length === 0)
    return res.status(400).json({ message: "El plan no tiene tareas." });
  await plan.update({ status: "published", publishedAt: new Date() });

  const assignedUsers = [
    ...new Set(
      (plan.items || []).map((i) => Number(i.assignedUserId)).filter(Boolean),
    ),
  ];
  const created = await Promise.all(
    assignedUsers.map((userId) =>
      Notifications.create({
        userId,
        type: "reminder",
        title: "Nuevo plan de tareas",
        message: `Se publicó el plan "${plan.title}" (${plan.startDate} a ${plan.endDate}).`,
        link: "/tareas",
      }),
    ),
  );
  created.forEach((n) => sendNotificationToUser(n.userId, n.toJSON()));
  res.json({ ok: true, planId: plan.id, notifiedUsers: assignedUsers.length });
};

export const getTaskPlans = async (req, res) => {
  const include = [
    {
      model: TaskItem,
      as: "items",
      include: [
        {
          model: Users,
          as: "assignedUser",
          attributes: [
            "id",
            "firstName",
            "secondName",
            "firstLastName",
            "secondLastName",
          ],
        },
      ],
    },
  ];
  let where = {};
  if (!isAdminRole(req)) {
    where = { status: { [Op.in]: ["published", "closed"] } };
  }
  const plans = await TaskPlan.findAll({
    where,
    include,
    order: [
      ["startDate", "DESC"],
      [{ model: TaskItem, as: "items" }, "priority", "ASC"],
      [{ model: TaskItem, as: "items" }, "id", "ASC"],
    ],
  });
  res.json(plans);
};

export const getMyTaskItems = async (req, res) => {
  const userId = Number(req.user?.userId || 0);
  if (!userId) return res.status(400).json({ message: "Usuario inválido." });
  const onlyActive = String(req.query.active || "1") !== "0";
  const wherePlan = onlyActive
    ? {
        status: { [Op.in]: ["published"] },
        startDate: { [Op.lte]: todayISO() },
        endDate: { [Op.gte]: todayISO() },
      }
    : { status: { [Op.in]: ["published", "closed"] } };
  const items = await TaskItem.findAll({
    where: { assignedUserId: userId },
    include: [{ model: TaskPlan, as: "plan", where: wherePlan }],
    order: [
      ["status", "ASC"],
      ["priority", "ASC"],
      ["id", "ASC"],
    ],
  });
  items.sort((a, b) => {
    const wa = TASK_STATUS_PRIORITY[a.status] ?? 99;
    const wb = TASK_STATUS_PRIORITY[b.status] ?? 99;
    if (wa !== wb) return wa - wb;
    return Number(a.priority || 0) - Number(b.priority || 0);
  });
  res.json(items);
};

export const updateTaskItemStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resultNote } = req.body;
  const item = await TaskItem.findByPk(id);
  if (!item) return res.status(404).json({ message: "Tarea no encontrada." });
  const userId = Number(req.user?.userId || 0);
  if (!isAdminRole(req) && Number(item.assignedUserId) !== userId) {
    return res.status(403).json({ message: "No autorizado para esta tarea." });
  }
  const nextStatus = ["pending", "in_progress", "done", "blocked"].includes(
    String(status),
  )
    ? String(status)
    : item.status;
  await item.update({
    status: nextStatus,
    resultNote: resultNote ?? item.resultNote,
    checkedAt: nextStatus === "done" ? new Date() : null,
    checkedByUserId:
      nextStatus === "done" ? userId || item.checkedByUserId : null,
  });
  res.json(item);
};

export const executeTaskOpenBox = async (req, res) => {
  const { id } = req.params;
  const item = await TaskItem.findByPk(id);
  if (!item) return res.status(404).json({ message: "Tarea no encontrada." });
  const userId = Number(req.user?.userId || 0);
  if (!isAdminRole(req) && Number(item.assignedUserId) !== userId) {
    return res.status(403).json({ message: "No autorizado para esta tarea." });
  }
  if (item.actionType !== "open_box") {
    return res
      .status(400)
      .json({ message: "Esta tarea no tiene acción de abrir caja." });
  }
  const payload = parseActionPayload(item);
  const t = await sequelize.transaction();
  try {
    const exec = await openBoxForTaskPayload(payload, t, item.id);
    await item.update(
      {
        status: "done",
        checkedAt: new Date(),
        checkedByUserId: userId || item.assignedUserId,
        resultNote: `[AUTO] Abrir caja ejecutado: ${exec.boxesOpened} caja(s), ${exec.unitsAdded} unidades.`,
      },
      { transaction: t },
    );
    await t.commit();
    res.json({ ok: true, taskItemId: item.id, ...exec });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};
