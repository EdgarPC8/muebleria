/**
 * Pedidos unificados: calendario mensual con pedidos de clientes y proveedores.
 * Basado en el módulo TiendaPedidosTodosPage (softed/tienda).
 */
import React, { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Collapse, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentsIcon from "@mui/icons-material/Payments";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import {
  createOrder,
  createSupplierOrder,
  getCustomers,
  getOrders,
  getProducts,
  getSupplierOrders,
  getSuppliers,
  updateOrder,
  updateSupplierOrder,
} from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";

const customerOrderItems = (order) => order.muebleria_order_items || [];
const supplierOrderItems = (order) => order.muebleria_supplier_order_items || [];
const customerDisplayName = (order) => order.customer?.name || "—";

const STATUS_SORT_WEIGHT = {
  pending: 0,
  received_only: 1,
  paid_only: 2,
  done: 3,
};

const getFlowSortKey = (event) => {
  const isReceived = Boolean(event?.receivedAt);
  const isPaid = Boolean(event?.paidAt);
  if (!isPaid && !isReceived) return "pending";
  if (!isPaid && isReceived) return "received_only";
  if (isPaid && !isReceived) return "paid_only";
  return "done";
};

export default function PedidosPage() {
  const theme = useTheme();
  const { user, toast } = useAuth();
  const canEditOrders = ["Programador", "Administrador"].includes(user?.loginRol || "");
  const [customerOrders, setCustomerOrders] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState("");
  const [filter, setFilter] = useState("all"); // all | customer | supplier
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [openEditEventDialog, setOpenEditEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [savingActionId, setSavingActionId] = useState("");
  const [paymentMethodByEvent, setPaymentMethodByEvent] = useState({});
  const [editForm, setEditForm] = useState({
    date: "",
    notes: "",
    draftProductId: "",
    draftQuantity: "",
    draftPrice: "",
    items: [],
  });
  const [customerForm, setCustomerForm] = useState({
    customerId: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    draftProductId: "",
    draftQuantity: "",
    draftPrice: "",
    items: [],
  });
  const [supplierForm, setSupplierForm] = useState({
    supplierId: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    draftProductId: "",
    draftQuantity: "",
    draftUnitPrice: "",
    items: [],
  });
  const customerItemsTotal = useMemo(
    () =>
      (customerForm.items || []).reduce(
        (acc, item) => acc + Number(item.quantity || 0) * Number(item.price || 0),
        0
      ),
    [customerForm.items]
  );
  const supplierItemsTotal = useMemo(
    () =>
      (supplierForm.items || []).reduce(
        (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0
      ),
    [supplierForm.items]
  );

  useEffect(() => {
    const load = async () => {
      const [c, s, cu, su, p] = await Promise.allSettled([
        getOrders(),
        getSupplierOrders(),
        getCustomers(),
        getSuppliers(),
        getProducts(),
      ]);
      setCustomerOrders(c.status === "fulfilled" ? c.value.data || [] : []);
      setSupplierOrders(s.status === "fulfilled" ? s.value.data || [] : []);
      setCustomers(cu.status === "fulfilled" ? cu.value.data || [] : []);
      setSuppliers(su.status === "fulfilled" ? su.value.data || [] : []);
      setProducts(p.status === "fulfilled" ? p.value.data || [] : []);
    };
    void load();
  }, []);

  const reloadOrders = async () => {
    const [c, s] = await Promise.allSettled([
      getOrders(),
      getSupplierOrders(),
    ]);
    setCustomerOrders(c.status === "fulfilled" ? c.value.data || [] : []);
    setSupplierOrders(s.status === "fulfilled" ? s.value.data || [] : []);
  };

  const events = useMemo(() => {
    const customer = customerOrders.map((o) => ({ ...o, kind: "customer" }));
    const supplier = supplierOrders.map((o) => ({ ...o, kind: "supplier" }));
    const all = [...customer, ...supplier];
    const filteredByKind =
      filter === "customer"
        ? all.filter((e) => e.kind === "customer")
        : filter === "supplier"
          ? all.filter((e) => e.kind === "supplier")
          : all;
    return filteredByKind.sort((a, b) => {
      const wa = STATUS_SORT_WEIGHT[getFlowSortKey(a)] ?? 99;
      const wb = STATUS_SORT_WEIGHT[getFlowSortKey(b)] ?? 99;
      if (wa !== wb) return wa - wb;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [customerOrders, supplierOrders, filter]);

  const startDay = startOfMonth(currentDate);
  const endDay = endOfMonth(currentDate);
  const daysToShow = eachDayOfInterval({
    start: startOfWeek(startDay, { weekStartsOn: 1 }),
    end: endOfWeek(endDay, { weekStartsOn: 1 }),
  });
  const weeks = [];
  for (let i = 0; i < daysToShow.length; i += 7) weeks.push(daysToShow.slice(i, i + 7));

  const selectedEvents = useMemo(
    () => (selectedDate ? events.filter((e) => isSameDay(new Date(e.date), selectedDate)) : []),
    [events, selectedDate]
  );

  useEffect(() => {
    if (!selectedDate) {
      setExpandedEventId("");
      return;
    }
    if (selectedEvents.length === 1) {
      const only = selectedEvents[0];
      setExpandedEventId(`${only.kind}-${only.id}`);
      return;
    }
    setExpandedEventId("");
  }, [selectedDate, selectedEvents]);

  const getEventTotal = (event) => {
    if (event.kind === "customer") {
      return customerOrderItems(event).reduce(
        (acc, item) => acc + Number(item.lineTotal ?? Number(item.quantity || 0) * Number(item.price || 0)),
        0
      );
    }
    return supplierOrderItems(event).reduce(
      (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    );
  };

  const getEventFlowState = (event) => {
    const isReceived = Boolean(event.receivedAt);
    const isPaid = Boolean(event.paidAt);
    if (isPaid && isReceived) {
      return {
        key: "done",
        label: "Entregado y pagado",
        borderColor: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.25 : 0.12),
        chipSx: {
          bgcolor: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.35 : 0.18),
          color: theme.palette.success.contrastText,
          borderColor: alpha(theme.palette.success.main, 0.65),
        },
      };
    }
    if (isPaid && !isReceived) {
      return {
        key: "paid_only",
        label: "Pagado y no entregado",
        borderColor: "#FB8C00",
        bgColor: alpha("#FB8C00", theme.palette.mode === "dark" ? 0.28 : 0.14),
        chipSx: {
          bgcolor: alpha("#FB8C00", theme.palette.mode === "dark" ? 0.4 : 0.2),
          color: theme.palette.mode === "dark" ? "#FFE0B2" : "#6D3B00",
          borderColor: alpha("#FB8C00", 0.65),
        },
      };
    }
    if (!isPaid && isReceived) {
      return {
        key: "received_only",
        label: "Entregado y no pagado",
        borderColor: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.28 : 0.16),
        chipSx: {
          bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.45 : 0.22),
          color: theme.palette.mode === "dark" ? "#FFF8E1" : "#5F4300",
          borderColor: alpha(theme.palette.warning.main, 0.7),
        },
      };
    }
    return {
      key: "pending",
      label: "No entregado ni pagado",
      borderColor: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.28 : 0.12),
      chipSx: {
        bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.42 : 0.18),
        color: theme.palette.error.contrastText,
        borderColor: alpha(theme.palette.error.main, 0.65),
      },
    };
  };

  const getDailyStatusMeta = (dailyEvents) => {
    if (!dailyEvents.length) return null;
    const keys = dailyEvents.map((ev) => getEventFlowState(ev).key);
    if (keys.includes("pending")) {
      return { color: theme.palette.error.main, Icon: CloseIcon };
    }
    if (keys.includes("received_only")) {
      return { color: theme.palette.warning.main, Icon: LocalShippingIcon };
    }
    if (keys.includes("paid_only")) {
      return { color: "#FB8C00", Icon: PaymentsIcon };
    }
    return { color: theme.palette.success.main, Icon: CheckCircleIcon };
  };

  const getKindChipStyle = (kind) =>
    kind === "customer"
      ? {
          label: "Cliente",
          sx: {
            bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.32 : 0.18),
            color: theme.palette.info.main,
            borderColor: alpha(theme.palette.info.main, 0.7),
          },
        }
      : {
          label: "Proveedor",
          sx: {
            bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.35 : 0.18),
            color: theme.palette.secondary.main,
            borderColor: alpha(theme.palette.secondary.main, 0.7),
          },
        };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  };

  const markEventAsPaid = async (event) => {
    const key = `${event.kind}-${event.id}`;
    const method = paymentMethodByEvent[key] || "efectivo";
    setSavingActionId(`${key}-paid`);
    try {
      if (event.kind === "customer") {
        await updateOrder(event.id, {
          customerId: Number(event.customerId),
          date: event.date,
          status: "pagado",
          paidAt: new Date().toISOString(),
          paymentMethod: method,
          notes: event.notes || null,
        });
      } else {
        await updateSupplierOrder(event.id, {
          supplierId: Number(event.supplierId),
          date: event.date,
          status: event.status === "recibido" ? "recibido" : event.status || "pendiente",
          paidAt: new Date().toISOString(),
          paymentMethod: method,
          notes: event.notes || null,
        });
      }
      await reloadOrders();
      void toast?.({ message: "Pago registrado.", variant: "success" });
    } catch (e) {
      void toast?.({
        message: e?.response?.data?.message || "No se pudo registrar el pago.",
        variant: "error",
      });
    } finally {
      setSavingActionId("");
    }
  };

  const markEventAsReceived = async (event) => {
    const key = `${event.kind}-${event.id}`;
    setSavingActionId(`${key}-received`);
    try {
      if (event.kind === "customer") {
        await updateOrder(event.id, {
          customerId: Number(event.customerId),
          date: event.date,
          status: event.status === "pagado" ? "pagado" : "entregado",
          receivedAt: new Date().toISOString(),
          notes: event.notes || null,
          paymentMethod: event.paymentMethod || null,
        });
      } else {
        await updateSupplierOrder(event.id, {
          supplierId: Number(event.supplierId),
          date: event.date,
          status: "recibido",
          receivedAt: new Date().toISOString(),
          notes: event.notes || null,
          paymentMethod: event.paymentMethod || null,
        });
      }
      await reloadOrders();
      void toast?.({
        message: event.kind === "customer" ? "Entrega registrada." : "Recepción registrada.",
        variant: "success",
      });
    } catch (e) {
      void toast?.({
        message: e?.response?.data?.message || "No se pudo registrar la recepción/entrega.",
        variant: "error",
      });
    } finally {
      setSavingActionId("");
    }
  };

  const addCustomerItem = () => {
    const productId = Number(customerForm.draftProductId || 0);
    const quantity = Number(customerForm.draftQuantity || 0);
    if (!productId || quantity <= 0) {
      void toast?.({ message: "Indica producto y cantidad mayor a 0.", variant: "warning" });
      return;
    }
    const product = products.find((p) => Number(p.id) === productId);
    if (!product) return;
    const price = Number(customerForm.draftPrice || product.salePrice || 0);
    setCustomerForm((s) => ({
      ...s,
      items: [...s.items, { productId, productName: product.name || "—", quantity, price }],
      draftProductId: "",
      draftQuantity: "",
      draftPrice: "",
    }));
  };

  const removeCustomerItem = (index) => {
    setCustomerForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }));
  };

  const addSupplierItem = () => {
    const productId = Number(supplierForm.draftProductId || 0);
    const quantity = Number(supplierForm.draftQuantity || 0);
    if (!productId || quantity <= 0) {
      void toast?.({ message: "Indica producto y cantidad mayor a 0.", variant: "warning" });
      return;
    }
    const product = products.find((p) => Number(p.id) === productId);
    if (!product) return;
    const unitPrice = Number(supplierForm.draftUnitPrice || 0);
    setSupplierForm((s) => ({
      ...s,
      items: [...s.items, { productId, productName: product.name || "—", quantity, unitPrice }],
      draftProductId: "",
      draftQuantity: "",
      draftUnitPrice: "",
    }));
  };

  const removeSupplierItem = (index) => {
    setSupplierForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }));
  };

  const openEditDialogForEvent = (event) => {
    const isCustomer = event.kind === "customer";
    const sourceItems = isCustomer ? customerOrderItems(event) : supplierOrderItems(event);
    const mapped = sourceItems.map((item) => ({
      productId: Number(item.productId),
      productName: item.product?.name || "—",
      quantity: Number(item.quantity || 0),
      price: Number(isCustomer ? item.price || 0 : item.unitPrice || 0),
    }));
    setEditingEvent(event);
    setEditForm({
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: event.notes || "",
      draftProductId: "",
      draftQuantity: "",
      draftPrice: "",
      items: mapped,
    });
    setOpenEditEventDialog(true);
  };

  const closeEditEventDialog = () => {
    setOpenEditEventDialog(false);
    setEditingEvent(null);
    setEditForm({
      date: "",
      notes: "",
      draftProductId: "",
      draftQuantity: "",
      draftPrice: "",
      items: [],
    });
  };

  const addEditItem = () => {
    const productId = Number(editForm.draftProductId || 0);
    const quantity = Number(editForm.draftQuantity || 0);
    if (!productId || quantity <= 0) {
      void toast?.({ message: "Indica producto y cantidad mayor a 0.", variant: "warning" });
      return;
    }
    const product = products.find((p) => Number(p.id) === productId);
    if (!product) return;
    const price = Number(editForm.draftPrice || product.salePrice || 0);
    setEditForm((s) => ({
      ...s,
      items: [...s.items, { productId, productName: product.name || "—", quantity, price }],
      draftProductId: "",
      draftQuantity: "",
      draftPrice: "",
    }));
  };

  const removeEditItem = (index) => {
    setEditForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }));
  };

  const updateEditItemField = (index, key, value) => {
    setEditForm((s) => ({
      ...s,
      items: s.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  const saveEditedOrder = async () => {
    if (!editingEvent) return;
    if (editForm.items.length === 0 || !editForm.date) {
      void toast?.({
        message: "Agrega al menos un ítem y una fecha.",
        variant: "warning",
      });
      return;
    }
    try {
      if (editingEvent.kind === "customer") {
        await updateOrder(editingEvent.id, {
          customerId: Number(editingEvent.customerId),
          date: `${editForm.date}T08:00:00`,
          notes: editForm.notes || null,
          status: editingEvent.status || "pendiente",
          receivedAt: editingEvent.receivedAt || null,
          paidAt: editingEvent.paidAt || null,
          paymentMethod: editingEvent.paymentMethod || null,
          items: editForm.items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
          })),
        });
      } else {
        await updateSupplierOrder(editingEvent.id, {
          supplierId: Number(editingEvent.supplierId),
          date: `${editForm.date}T08:00:00`,
          notes: editForm.notes || null,
          status: editingEvent.status || "pendiente",
          receivedAt: editingEvent.receivedAt || null,
          paidAt: editingEvent.paidAt || null,
          paymentMethod: editingEvent.paymentMethod || null,
          items: editForm.items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.price || 0),
          })),
        });
      }
      closeEditEventDialog();
      await reloadOrders();
      void toast?.({ message: "Pedido actualizado.", variant: "success" });
    } catch (e) {
      void toast?.({
        message: e?.response?.data?.message || "No se pudo guardar el pedido.",
        variant: "error",
      });
    }
  };

  const handleSaveCustomerOrder = async () => {
    if (!customerForm.customerId || customerForm.items.length === 0) {
      void toast?.({
        message: "Selecciona cliente y agrega al menos un producto.",
        variant: "warning",
      });
      return;
    }
    try {
      await createOrder({
        customerId: Number(customerForm.customerId),
        date: `${customerForm.date}T08:00:00`,
        notes: customerForm.notes || null,
        items: customerForm.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(item.price || 0),
        })),
      });
      setOpenCustomerDialog(false);
      setCustomerForm({
        customerId: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        draftProductId: "",
        draftQuantity: "",
        draftPrice: "",
        items: [],
      });
      await reloadOrders();
      void toast?.({ message: "Pedido creado.", variant: "success" });
    } catch (e) {
      void toast?.({
        message: e?.response?.data?.message || "No se pudo crear el pedido.",
        variant: "error",
      });
    }
  };

  const handleSaveSupplierOrder = async () => {
    if (!supplierForm.supplierId || supplierForm.items.length === 0) {
      void toast?.({
        message: "Selecciona proveedor y agrega al menos un producto.",
        variant: "warning",
      });
      return;
    }
    try {
      await createSupplierOrder({
        supplierId: Number(supplierForm.supplierId),
        date: `${supplierForm.date}T08:00:00`,
        notes: supplierForm.notes || null,
        items: supplierForm.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice || 0),
        })),
      });
      setOpenSupplierDialog(false);
      setSupplierForm({
        supplierId: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        draftProductId: "",
        draftQuantity: "",
        draftUnitPrice: "",
        items: [],
      });
      await reloadOrders();
      void toast?.({ message: "Pedido creado.", variant: "success" });
    } catch (e) {
      void toast?.({
        message: e?.response?.data?.message || "No se pudo crear el pedido.",
        variant: "error",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Pedidos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Calendario de pedidos de clientes y proveedores. Selecciona un día para ver detalle, marcar entrega o pago.
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.5 }}>
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={filter === "customer" ? "contained" : "outlined"}
            onClick={() => setFilter("customer")}
            sx={{
              bgcolor: filter === "customer" ? alpha(theme.palette.info.main, 0.18) : "transparent",
              color: theme.palette.info.main,
              borderColor: alpha(theme.palette.info.main, 0.7),
              "&:hover": {
                bgcolor: alpha(theme.palette.info.main, 0.24),
                borderColor: theme.palette.info.main,
              },
            }}
          >
            Clientes
          </Button>
          <Button
            variant={filter === "supplier" ? "contained" : "outlined"}
            onClick={() => setFilter("supplier")}
            sx={{
              bgcolor: filter === "supplier" ? alpha(theme.palette.secondary.main, 0.2) : "transparent",
              color: theme.palette.secondary.main,
              borderColor: alpha(theme.palette.secondary.main, 0.7),
              "&:hover": {
                bgcolor: alpha(theme.palette.secondary.main, 0.28),
                borderColor: theme.palette.secondary.main,
              },
            }}
          >
            Proveedores
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            onClick={() => setOpenCustomerDialog(true)}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.22),
              color: theme.palette.info.main,
              border: `1px solid ${alpha(theme.palette.info.main, 0.6)}`,
              "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.3) },
            }}
          >
            Añadir pedido de cliente
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenSupplierDialog(true)}
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.22),
              color: theme.palette.secondary.main,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.6)}`,
              "&:hover": { bgcolor: alpha(theme.palette.secondary.main, 0.32) },
            }}
          >
            Añadir pedido de proveedor
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button onClick={() => setCurrentDate((d) => addMonths(d, -1))}>Mes anterior</Button>
          <Button onClick={() => setCurrentDate((d) => addMonths(d, 1))}>Mes siguiente</Button>
        </Box>

        <Grid container spacing={1} sx={{ mb: 1 }}>
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((dayName) => (
            <Grid item xs={12 / 7} key={dayName}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{dayName}</Typography>
            </Grid>
          ))}
        </Grid>

        {weeks.map((week, idx) => {
          const shouldShowCollapse = selectedDate && week.some((day) => isSameDay(day, selectedDate));
          return (
            <React.Fragment key={idx}>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {week.map((day) => {
                  const daily = events.filter((e) => isSameDay(new Date(e.date), day));
                  const dailyCustomers = daily.filter((d) => d.kind === "customer");
                  const dailySuppliers = daily.filter((d) => d.kind === "supplier");
                  const customerCount = dailyCustomers.length;
                  const supplierCount = dailySuppliers.length;
                  const customerStatusMeta = getDailyStatusMeta(dailyCustomers);
                  const supplierStatusMeta = getDailyStatusMeta(dailySuppliers);
                  const isSelected = selectedDate && isSameDay(selectedDate, day);
                  return (
                    <Grid item xs={12 / 7} key={day.toISOString()}>
                      <Paper
                        onClick={() => setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day))}
                        sx={{
                          p: 1,
                          minHeight: 95,
                          cursor: "pointer",
                          opacity: isSameMonth(day, currentDate) ? 1 : 0.45,
                          border: isSelected ? "1px solid" : "1px dashed",
                          borderColor: isSelected ? "primary.main" : "divider",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">{format(day, "d")}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Total: {daily.length}
                          </Typography>
                        </Stack>
                        <Stack spacing={0.1} sx={{ mt: 0.3 }}>
                          <Stack direction="row" spacing={0.4} alignItems="center">
                            {customerCount > 0 && customerStatusMeta ? (
                              <customerStatusMeta.Icon sx={{ fontSize: 14, color: customerStatusMeta.color }} />
                            ) : null}
                            <Typography variant="caption" color="info.main">Cli: {customerCount}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.4} alignItems="center">
                            {supplierCount > 0 && supplierStatusMeta ? (
                              <supplierStatusMeta.Icon sx={{ fontSize: 14, color: supplierStatusMeta.color }} />
                            ) : null}
                            <Typography variant="caption" color="secondary.main">Prov: {supplierCount}</Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Collapse in={shouldShowCollapse} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 1, mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Eventos del {selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}
                  </Typography>
                  {selectedEvents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No hay pedidos para este día.
                    </Typography>
                  ) : (
                    selectedEvents.map((e) => {
                      const flow = getEventFlowState(e);
                      const kind = getKindChipStyle(e.kind);
                      const isReceived = Boolean(e.receivedAt);
                      const isPaid = Boolean(e.paidAt);
                      const isDone = isReceived && isPaid;
                      const eventKey = `${e.kind}-${e.id}`;
                      const isSingleEventDay = selectedEvents.length === 1;
                      const isExpanded = isSingleEventDay || expandedEventId === eventKey;
                      return (
                        <Accordion
                          key={eventKey}
                          expanded={isExpanded}
                          onChange={(_, expanded) => {
                            if (isSingleEventDay) return;
                            setExpandedEventId(expanded ? eventKey : "");
                          }}
                          sx={{
                            mt: 1,
                            borderLeft: "4px solid",
                            borderLeftColor: flow.borderColor,
                            bgcolor: flow.bgColor,
                            boxShadow: "none",
                            "&:before": { display: "none" },
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }} alignItems={{ sm: "center" }} justifyContent="space-between">
                              <Typography variant="body2" fontWeight={700}>
                                {e.kind === "customer"
                                  ? `Cliente: ${customerDisplayName(e)} · #${e.id}`
                                  : `Proveedor: ${e.supplier?.name || "—"} · #${e.id}`}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                Total: ${getEventTotal(e).toFixed(2)}
                              </Typography>
                              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                                <Chip size="small" variant="outlined" label={kind.label} sx={kind.sx} />
                                <Chip size="small" variant="outlined" label={flow.label} sx={flow.chipSx} />
                                {isDone ? <Chip size="small" color="success" label="Listo" /> : null}
                              </Stack>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ mt: 0.2 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Productos del pedido:
                              </Typography>
                              <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                                {(e.kind === "customer" ? customerOrderItems(e) : supplierOrderItems(e)).map((item) => {
                                  const qty = Number(item.quantity || 0);
                                  const unitPrice = Number(e.kind === "customer" ? item.price || 0 : item.unitPrice || 0);
                                  const lineTotal = qty * unitPrice;
                                  return (
                                    <Typography key={`${e.kind}-${e.id}-item-${item.id || `${item.productId}-${qty}-${unitPrice}`}`} variant="caption" color="text.secondary">
                                      • {item.product?.name || "—"} · {qty} x ${unitPrice.toFixed(2)} = ${lineTotal.toFixed(2)}
                                    </Typography>
                                  );
                                })}
                              </Stack>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.8 }}>
                              Recibido: {formatDateTime(e.receivedAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
                              Pagado: {formatDateTime(e.paidAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
                              Método pago: {e.paymentMethod || "—"}
                            </Typography>
                            {canEditOrders ? (
                              <Button size="small" variant="text" sx={{ mt: 0.6 }} onClick={() => openEditDialogForEvent(e)}>
                                Editar pedido
                              </Button>
                            ) : null}
                            {!isDone ? (
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.2 }}>
                                <TextField
                                  select
                                  size="small"
                                  label="Método de pago"
                                  value={paymentMethodByEvent[`${e.kind}-${e.id}`] || "efectivo"}
                                  onChange={(ev) =>
                                    setPaymentMethodByEvent((prev) => ({
                                      ...prev,
                                      [`${e.kind}-${e.id}`]: ev.target.value,
                                    }))
                                  }
                                  sx={{ minWidth: 170 }}
                                >
                                  <MenuItem value="efectivo">Efectivo</MenuItem>
                                  <MenuItem value="transferencia">Transferencia</MenuItem>
                                  <MenuItem value="cheque">Cheque</MenuItem>
                                  <MenuItem value="tarjeta">Tarjeta</MenuItem>
                                </TextField>
                                {!isReceived ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={savingActionId === `${e.kind}-${e.id}-received`}
                                    onClick={() => markEventAsReceived(e)}
                                  >
                                    {savingActionId === `${e.kind}-${e.id}-received`
                                      ? "Guardando..."
                                      : "Marcar recibido"}
                                  </Button>
                                ) : null}
                                {!isPaid ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={savingActionId === `${e.kind}-${e.id}-paid`}
                                    onClick={() => markEventAsPaid(e)}
                                  >
                                    {savingActionId === `${e.kind}-${e.id}-paid`
                                      ? "Guardando..."
                                      : "Marcar pagado"}
                                  </Button>
                                ) : null}
                              </Stack>
                            ) : null}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })
                  )}
                </Box>
              </Collapse>
            </React.Fragment>
          );
        })}

        {!selectedDate ? (
          <Typography variant="body2" color="text.secondary">
            Selecciona un día para ver detalle.
          </Typography>
        ) : null}
      </Paper>

      <SimpleDialog
        open={openEditEventDialog}
        onClose={closeEditEventDialog}
        title={editingEvent ? `Editar pedido ${editingEvent.kind === "customer" ? "cliente" : "proveedor"} #${editingEvent.id}` : "Editar pedido"}
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Fecha"
              InputLabelProps={{ shrink: true }}
              value={editForm.date}
              onChange={(e) => setEditForm((s) => ({ ...s, date: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Notas"
              value={editForm.notes}
              onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Producto"
              value={editForm.draftProductId}
              onChange={(e) => setEditForm((s) => ({ ...s, draftProductId: e.target.value }))}
            >
              {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              type="number"
              fullWidth
              size="small"
              label="Cant."
              value={editForm.draftQuantity}
              onChange={(e) => setEditForm((s) => ({ ...s, draftQuantity: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="number"
              fullWidth
              size="small"
              label={editingEvent?.kind === "customer" ? "Precio" : "Costo unitario"}
              value={editForm.draftPrice}
              onChange={(e) => setEditForm((s) => ({ ...s, draftPrice: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" onClick={addEditItem}>
              Añadir item
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                Items del pedido ({editForm.items.length})
              </Typography>
              {editForm.items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Aún no agregas productos.</Typography>
              ) : (
                <Stack spacing={0.9}>
                  {editForm.items.map((item, index) => (
                    <Grid key={`edit-item-${index}`} container spacing={1} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">{item.productName}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Cantidad"
                          value={item.quantity}
                          onChange={(e) => updateEditItemField(index, "quantity", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label={editingEvent?.kind === "customer" ? "Precio" : "Costo"}
                          value={item.price}
                          onChange={(e) => updateEditItemField(index, "price", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button fullWidth color="error" variant="outlined" onClick={() => removeEditItem(index)}>
                          Quitar
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={saveEditedOrder}>
              Guardar cambios del pedido
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>

      <SimpleDialog
        open={openCustomerDialog}
        onClose={() => setOpenCustomerDialog(false)}
        title="Añadir pedido de cliente"
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth size="small" label="Cliente" value={customerForm.customerId} onChange={(e) => setCustomerForm((s) => ({ ...s, customerId: e.target.value }))}>
              {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField type="date" fullWidth size="small" label="Fecha" InputLabelProps={{ shrink: true }} value={customerForm.date} onChange={(e) => setCustomerForm((s) => ({ ...s, date: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Notas" value={customerForm.notes} onChange={(e) => setCustomerForm((s) => ({ ...s, notes: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Producto"
              value={customerForm.draftProductId}
              onChange={(e) => {
                const nextId = e.target.value;
                const product = products.find((p) => String(p.id) === String(nextId));
                setCustomerForm((s) => ({
                  ...s,
                  draftProductId: nextId,
                  draftPrice:
                    product
                      ? String(Number(product.salePrice || 0))
                      : s.draftPrice,
                }));
              }}
            >
              {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField type="number" fullWidth size="small" label="Cant." value={customerForm.draftQuantity} onChange={(e) => setCustomerForm((s) => ({ ...s, draftQuantity: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField type="number" fullWidth size="small" label="Precio" value={customerForm.draftPrice} onChange={(e) => setCustomerForm((s) => ({ ...s, draftPrice: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" onClick={addCustomerItem}>
              Añadir item
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                sx={{ mb: 0.8 }}
              >
                <Typography variant="subtitle2">
                  Items del pedido ({customerForm.items.length})
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  Total: ${customerItemsTotal.toFixed(2)}
                </Typography>
              </Stack>
              {customerForm.items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aún no agregas productos.
                </Typography>
              ) : (
                <Stack spacing={0.6}>
                  {customerForm.items.map((item, index) => (
                    <Stack key={`c-item-${index}`} direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2">
                        {item.productName} · {Number(item.quantity || 0)} x $
                        {Number(item.price || 0).toFixed(2)} = $
                        {(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => removeCustomerItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={handleSaveCustomerOrder}>
              Guardar pedido
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>

      <SimpleDialog
        open={openSupplierDialog}
        onClose={() => setOpenSupplierDialog(false)}
        title="Añadir pedido de proveedor"
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth size="small" label="Proveedor" value={supplierForm.supplierId} onChange={(e) => setSupplierForm((s) => ({ ...s, supplierId: e.target.value }))}>
              {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField type="date" fullWidth size="small" label="Fecha" InputLabelProps={{ shrink: true }} value={supplierForm.date} onChange={(e) => setSupplierForm((s) => ({ ...s, date: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Notas" value={supplierForm.notes} onChange={(e) => setSupplierForm((s) => ({ ...s, notes: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Producto"
              value={supplierForm.draftProductId}
              onChange={(e) => {
                const nextId = e.target.value;
                const product = products.find((p) => String(p.id) === String(nextId));
                setSupplierForm((s) => ({
                  ...s,
                  draftProductId: nextId,
                  draftUnitPrice:
                    product
                      ? String(Number(product.avgCostBase || product.salePrice || 0))
                      : s.draftUnitPrice,
                }));
              }}
            >
              {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField type="number" fullWidth size="small" label="Cant." value={supplierForm.draftQuantity} onChange={(e) => setSupplierForm((s) => ({ ...s, draftQuantity: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField type="number" fullWidth size="small" label="Costo unitario" value={supplierForm.draftUnitPrice} onChange={(e) => setSupplierForm((s) => ({ ...s, draftUnitPrice: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" onClick={addSupplierItem}>
              Añadir item
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                sx={{ mb: 0.8 }}
              >
                <Typography variant="subtitle2">
                  Items del pedido ({supplierForm.items.length})
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  Total: ${supplierItemsTotal.toFixed(2)}
                </Typography>
              </Stack>
              {supplierForm.items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aún no agregas productos.
                </Typography>
              ) : (
                <Stack spacing={0.6}>
                  {supplierForm.items.map((item, index) => (
                    <Stack key={`s-item-${index}`} direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2">
                        {item.productName} · {Number(item.quantity || 0)} x $
                        {Number(item.unitPrice || 0).toFixed(2)} = $
                        {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => removeSupplierItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={handleSaveSupplierOrder}>
              Guardar pedido
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
    </Box>
  );
}

