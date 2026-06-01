import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import TablePro from "../components/Tables/TablePro.jsx";
import { getOrders } from "../api/muebleriaRequest.js";
import {
  isCajaPosOrder,
  getOrderCustomerDisplay,
} from "../utils/posOrderUtils.js";

const STATUS_LABELS = {
  pendiente: "Pendiente",
  entregado: "Entregado",
  pagado: "Pagado",
};

const STATUS_COLORS = {
  pendiente: "warning",
  entregado: "info",
  pagado: "success",
};

const todayISO = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const FILTERS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "all", label: "Todas" },
];

function inRange(dateStr, start, end) {
  const d = (dateStr || "").slice(0, 10);
  return d >= start && d <= end;
}

function weekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}

function monthRange() {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return start;
}

function formatDate(iso) {
  if (!iso) return "—";
  return iso.slice(0, 19).replace("T", " ");
}

function orderTotal(order) {
  const items = order.muebleria_order_items || [];
  return items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
}

function itemsSummary(order) {
  const items = order.muebleria_order_items || [];
  const names = items.map((i) => i.product?.name);

  if (names.length <= 2) return names.join(", ");
  return `${names[0]} y ${names.length - 1} más`;
}

export default function VentasPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today");
  const [detailOrder, setDetailOrder] = useState(null);

  const load = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    const today = todayISO();
    let start;
    let end = today + "T23:59:59";
    if (filter === "today") {
      start = today;
    } else if (filter === "week") {
      start = weekRange();
    } else if (filter === "month") {
      start = monthRange();
    } else {
      start = "2000-01-01";
    }
    return orders.filter((o) => inRange(o.date || o.createdAt, start, end));
  }, [orders, filter]);

  const summary = useMemo(() => {
    const total = filteredOrders.length;
    const revenue = filteredOrders.reduce((s, o) => s + orderTotal(o), 0);
    const cash = filteredOrders.filter(
      (o) => o.paymentMethod === "efectivo",
    ).length;
    const paid = filteredOrders.filter((o) => o.status === "pagado").length;
    const caja = filteredOrders.filter((o) => isCajaPosOrder(o)).length;
    return { total, revenue, cash, paid, caja };
  }, [filteredOrders]);

  const columns = useMemo(
    () => [
      { id: "id", label: "#" },
      {
        id: "date",
        label: "Fecha",
        render: (r) => formatDate(r.date || r.createdAt),
        getSortValue: (r) => r.date || r.createdAt,
      },
      {
        id: "customer",
        label: "Cliente",
        render: (r) => getOrderCustomerDisplay(r),
      },
      {
        id: "items",
        label: "Productos",
        render: (r) => itemsSummary(r),
      },

      {
        id: "total",
        label: "Total",
        render: (r) => `$${Number(orderTotal(r)).toFixed(2)}`,
        getSortValue: (r) => orderTotal(r),
      },
      {
        id: "paymentMethod",
        label: "Pago",
        render: (r) => r.paymentMethod || "—",
      },

      {
        id: "status",
        label: "Estado",
        render: (r) => (
          <Chip
            size="small"
            label={STATUS_LABELS[r.status] || r.status}
            color={STATUS_COLORS[r.status] || "default"}
            variant="outlined"
          />
        ),
      },
      {
        id: "origin",
        label: "Origen",
        render: (r) =>
          isCajaPosOrder(r) ? (
            <Chip
              size="small"
              label="Caja"
              color="primary"
              variant="outlined"
            />
          ) : (
            <Chip size="small" label="Pedido" variant="outlined" />
          ),
      },
      {
        id: "acc",
        label: "",
        render: (r) => (
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => setDetailOrder(r)}
          >
            Detalles
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Ventas
      </Typography>

      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => v && setFilter(v)}
              size="small"
            >
              {FILTERS.map((f) => (
                <ToggleButton key={f.value} value={f.value}>
                  {f.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs />
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={load}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Paper variant="panel" sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={700}>
              {summary.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ventas
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="panel" sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={700}>
              ${Number(summary.revenue).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="panel" sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={700}>
              {summary.caja}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              De Caja
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="panel" sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={700}>
              {summary.paid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pagadas
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <TablePro
        title="Historial de ventas"
        rows={filteredOrders}
        columns={columns}
        showSearch
        showPagination
        showIndex
        tableMaxHeight={480}
      />

      <SimpleDialog
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        title={`Venta #${detailOrder?.id || ""}`}
        maxWidth="md"
        fullWidth
      >
        {detailOrder && (
          <Box>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Fecha</Typography>
                <Typography variant="body1">{formatDate(detailOrder.date || detailOrder.createdAt)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Cliente</Typography>
                <Typography variant="body1">{getOrderCustomerDisplay(detailOrder)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Método de pago</Typography>
                <Typography variant="body1">{detailOrder.paymentMethod || "—"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Estado</Typography>
                <Chip
                  size="small"
                  label={STATUS_LABELS[detailOrder.status] || detailOrder.status}
                  color={STATUS_COLORS[detailOrder.status] || "default"}
                  variant="outlined"
                />
              </Grid>
              {detailOrder.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Notas</Typography>
                  <Typography variant="body1">{detailOrder.notes}</Typography>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Productos
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detailOrder.muebleria_order_items || []).map((item, idx) => (
                    <TableRow key={item.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.product?.name || "—"}</TableCell>
                      <TableCell align="right">{Number(item.quantity || 0)}</TableCell>
                      <TableCell align="right">${Number(item.price || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">${Number(item.lineTotal || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Total: ${Number(orderTotal(detailOrder)).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </SimpleDialog>
    </Box>
  );
}
