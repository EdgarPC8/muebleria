/**
 * Kardex de movimientos de inventario: entradas, salidas y ajustes.
 * API: GET /muebleria/movements · POST /muebleria/stock-adjustment
 */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TuneIcon from "@mui/icons-material/Tune";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import {
  createStockAdjustment,
  getProducts,
  getStockMovements,
} from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

const TYPE_LABELS = {
  entrada_compra: "Entrada compra",
  salida_venta: "Salida venta",
  ajuste_entrada: "Ajuste entrada",
  ajuste_salida: "Ajuste salida",
};

const TYPE_COLORS = {
  entrada_compra: "success",
  salida_venta: "error",
  ajuste_entrada: "info",
  ajuste_salida: "warning",
};

export default function MovimientosPage() {
  const { user, toast } = useAuth();
  const canAdjust = ["Programador", "Administrador"].includes(user?.loginRol || "");
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [openAdjust, setOpenAdjust] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    kind: "entrada",
    quantityBase: "",
    note: "",
  });

  const load = async () => {
    const [m, p] = await Promise.allSettled([getStockMovements(), getProducts()]);
    setMovements(m.status === "fulfilled" ? m.value.data || [] : []);
    setProducts(p.status === "fulfilled" ? p.value.data || [] : []);
  };

  useEffect(() => {
    load();
  }, []);

  const columns = useMemo(
    () => [
      { id: "id", label: "#" },
      {
        id: "createdAt",
        label: "Fecha",
        render: (r) => (r.createdAt || "").slice(0, 19).replace("T", " "),
      },
      { id: "product", label: "Producto", render: (r) => r.product?.name || "—" },
      {
        id: "type",
        label: "Tipo",
        render: (r) => (
          <Chip
            size="small"
            label={TYPE_LABELS[r.type] || r.type}
            color={TYPE_COLORS[r.type] || "default"}
            variant="outlined"
          />
        ),
      },
      { id: "quantityBase", label: "Cantidad" },
      {
        id: "unitCostBase",
        label: "Costo unit.",
        render: (r) => `$${Number(r.unitCostBase || 0).toFixed(2)}`,
      },
      { id: "referenceType", label: "Referencia", render: (r) => r.referenceType || "—" },
      { id: "referenceId", label: "ID ref.", render: (r) => r.referenceId ?? "—" },
      { id: "note", label: "Nota", render: (r) => r.note || "—" },
    ],
    []
  );

  const saveAdjust = async () => {
    if (!form.productId || !form.quantityBase) {
      toast({ message: "Selecciona producto y cantidad.", variant: "warning" });
      return;
    }
    try {
      await withMutationToast(toast, {
        promise: createStockAdjustment({
          productId: Number(form.productId),
          kind: form.kind,
          quantityBase: Number(form.quantityBase),
          note: form.note?.trim() || null,
        }),
        onSuccess: async () => {
          setOpenAdjust(false);
          setForm({ productId: "", kind: "entrada", quantityBase: "", note: "" });
          await load();
        },
      });
    } catch {
      /* toast */
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Movimientos de inventario
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Kardex de entradas, salidas y ajustes. Se generan al entregar pedidos, recibir compras o registrar ajustes manuales.
      </Typography>

      <Paper variant="panel" sx={{ p: 2, mb: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "flex-end" }}>
        <Button startIcon={<RefreshIcon />} onClick={() => load()}>
          Actualizar
        </Button>
        {canAdjust && (
          <Button variant="contained" startIcon={<TuneIcon />} onClick={() => setOpenAdjust(true)}>
            Ajuste manual
          </Button>
        )}
      </Paper>

      <TablePro
        title="Kardex"
        rows={movements}
        columns={columns}
        showSearch
        showPagination
        showIndex
        defaultRowsPerPage={15}
        tableMaxHeight={520}
      />

      <SimpleDialog
        open={openAdjust}
        onClose={() => setOpenAdjust(false)}
        title="Ajuste de stock"
        maxWidth="sm"
        fullWidth
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Producto"
              value={form.productId}
              onChange={(e) => setForm((s) => ({ ...s, productId: e.target.value }))}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} (stock: {Number(p.stockBase || 0)})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tipo"
              value={form.kind}
              onChange={(e) => setForm((s) => ({ ...s, kind: e.target.value }))}
            >
              <MenuItem value="entrada">Entrada (suma stock)</MenuItem>
              <MenuItem value="salida">Salida (resta stock)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              fullWidth
              size="small"
              label="Cantidad"
              value={form.quantityBase}
              onChange={(e) => setForm((s) => ({ ...s, quantityBase: e.target.value }))}
              inputProps={{ min: 0.01, step: "any" }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Nota (opcional)"
              value={form.note}
              onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={saveAdjust}>
              Registrar ajuste
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
    </Box>
  );
}
