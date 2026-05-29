/**
 * Exporta estructura de tablas y relaciones desde los modelos Sequelize (para diagrama en frontend).
 */
import { sequelize } from "../database/connection.js";
import "../models/index.js";

const TABLE_GROUPS = {
  users: "sistema_base",
  user_data: "sistema_base",
  roles: "sistema_base",
  accounts: "sistema_base",
  accountRoles: "sistema_base",
  app_settings: "sistema_base",
  notifications: "sistema_base",
  notification_programs: "sistema_base",
  logs: "sistema_base",
  muebleria_suppliers: "muebleria_catalogo",
  muebleria_measure_units: "muebleria_catalogo",
  muebleria_product_categories: "muebleria_catalogo",
  muebleria_brands: "muebleria_catalogo",
  muebleria_products: "muebleria_catalogo",
  muebleria_customers: "muebleria_catalogo",
  muebleria_orders: "muebleria_operacion",
  muebleria_order_items: "muebleria_operacion",
  muebleria_supplier_orders: "muebleria_operacion",
  muebleria_supplier_order_items: "muebleria_operacion",
  muebleria_purchases: "muebleria_operacion",
  muebleria_purchase_items: "muebleria_operacion",
  muebleria_stock_movements: "muebleria_operacion",
  muebleria_finance_entries: "muebleria_operacion",
  muebleria_task_plans: "muebleria_tareas",
  muebleria_task_items: "muebleria_tareas",
};

const GROUP_LABELS = {
  sistema_base: "Sistema base",
  muebleria_catalogo: "Catálogo e inventario",
  muebleria_operacion: "Ventas, compras y kardex",
  muebleria_tareas: "Tareas",
};

function formatColumnType(attr) {
  const t = attr.type;
  if (!t) return "unknown";
  const key = t.key || t.constructor?.key;
  if (key === "INTEGER") return "int";
  if (key === "STRING") return `varchar${t._length ? `(${t._length})` : ""}`;
  if (key === "TEXT") return "text";
  if (key === "BOOLEAN") return "boolean";
  if (key === "DATE") return "datetime";
  if (key === "DATEONLY") return "date";
  if (key === "FLOAT") return "float";
  if (key === "DECIMAL") return `decimal${t._precision ? `(${t._precision},${t._scale || 0})` : ""}`;
  if (key === "ENUM") return `enum(${Array.isArray(t.values) ? t.values.join("|") : ""})`;
  if (key === "JSON") return "json";
  return key ? String(key).toLowerCase() : "unknown";
}

function collectRelations() {
  const relations = [];
  const seen = new Set();

  const push = (rel) => {
    const key = `${rel.fromTable}.${rel.fromColumn}->${rel.toTable}.${rel.toColumn}`;
    if (seen.has(key)) return;
    seen.add(key);
    relations.push(rel);
  };

  for (const model of Object.values(sequelize.models)) {
    const fromTable = model.getTableName();

    for (const assoc of Object.values(model.associations)) {
      if (assoc.associationType === "BelongsTo") {
        const toTable = assoc.target.getTableName();
        push({
          fromTable,
          fromColumn: assoc.foreignKey,
          toTable,
          toColumn: assoc.targetKey || "id",
          label: `${fromTable}.${assoc.foreignKey} → ${toTable}.id`,
        });
      }

      if (assoc.associationType === "BelongsToMany") {
        const throughModel = assoc.through?.model;
        if (!throughModel) continue;
        const junction = throughModel.getTableName();
        const toTable = assoc.target.getTableName();
        push({
          fromTable: junction,
          fromColumn: assoc.foreignKey,
          toTable: fromTable,
          toColumn: "id",
          label: `${junction}.${assoc.foreignKey} → ${fromTable}`,
        });
        push({
          fromTable: junction,
          fromColumn: assoc.otherKey,
          toTable,
          toColumn: "id",
          label: `${junction}.${assoc.otherKey} → ${toTable}`,
        });
      }
    }
  }

  return relations;
}

function buildMermaidEr(tables, relations) {
  const lines = ["erDiagram"];
  const sanitize = (s) => String(s).replace(/[^a-zA-Z0-9_]/g, "_");

  for (const t of tables) {
    const id = sanitize(t.name);
    lines.push(`  ${id} {`);
    const cols = t.columns.slice(0, 16);
    for (const c of cols) {
      const typeLabel = String(c.type).replace(/[^a-zA-Z0-9_|]/g, "_").slice(0, 28);
      let tag = "";
      if (c.primaryKey) tag = " PK";
      else if (c.foreignKey) tag = " FK";
      lines.push(`    ${typeLabel} ${c.name}${tag}`);
    }
    if (t.columns.length > 16) lines.push("    string mas_columnas");
    lines.push("  }");
  }

  for (const r of relations) {
    const a = sanitize(r.fromTable);
    const b = sanitize(r.toTable);
    lines.push(`  ${a} }o--|| ${b} : "${r.fromColumn}"`);
  }

  return lines.join("\n");
}

export function exportDatabaseSchema() {
  const fkTargets = new Map();

  const relations = collectRelations();
  for (const r of relations) {
    fkTargets.set(`${r.fromTable}.${r.fromColumn}`, `${r.toTable}.${r.toColumn}`);
  }

  const tables = Object.values(sequelize.models)
    .map((model) => {
      const name = model.getTableName();
      const columns = Object.entries(model.rawAttributes).map(([colName, attr]) => {
        const fkRef = fkTargets.get(`${name}.${colName}`);
        return {
          name: colName,
          type: formatColumnType(attr),
          primaryKey: Boolean(attr.primaryKey),
          unique: Boolean(attr.unique || attr._unique),
          allowNull: attr.allowNull !== false,
          foreignKey: fkRef || null,
        };
      });
      return {
        name,
        modelName: model.name,
        group: TABLE_GROUPS[name] || "otros",
        columns,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const groups = Object.entries(GROUP_LABELS).map(([id, label]) => ({
    id,
    label,
    tables: tables.filter((t) => t.group === id).map((t) => t.name),
  }));

  const mermaidEr = buildMermaidEr(tables, relations);

  return {
    database: "muebleria",
    tableCount: tables.length,
    relationCount: relations.length,
    groups,
    tables,
    relations,
    mermaidEr,
  };
}
