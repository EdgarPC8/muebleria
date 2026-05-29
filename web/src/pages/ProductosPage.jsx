/**
 * Catálogo de productos: listado, alta/edición con imagen y marcas.
 */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from "@mui/material";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import {
  getProducts,
  getCategories,
  getBrands,
  getUnits,
  createBrand,
  createProduct,
  updateProduct,
} from "../api/muebleriaRequest.js";
import { buildImageUrl } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

const emptyForm = () => ({
  name: "",
  sku: "",
  categoryId: "",
  brandId: "",
  baseUnitId: "",
  sizeLabel: "",
  salePrice: "",
  stockBase: "0",
  minStockBase: "0",
});

export default function ProductosPage() {
  const { toast } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [imageFile, setImageFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newBrand, setNewBrand] = useState("");

  const loadAll = async () => {
    const [p, c, b, u] = await Promise.all([getProducts(), getCategories(), getBrands(), getUnits()]);
    setProducts(p.data || []);
    setCategories(c.data || []);
    setBrands(b.data || []);
    setUnits(u.data || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    const defaultUnit = units.find((x) => x.isBase && x.groupName === "unit") || units[0];
    if (defaultUnit) setForm((f) => ({ ...f, baseUnitId: String(defaultUnit.id) }));
    setOpenDialog(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      sku: row.sku || "",
      categoryId: row.categoryId ? String(row.categoryId) : "",
      brandId: row.brandId ? String(row.brandId) : "",
      baseUnitId: String(row.baseUnitId || ""),
      sizeLabel: row.sizeLabel || "",
      salePrice: String(row.salePrice ?? ""),
      stockBase: String(row.stockBase ?? 0),
      minStockBase: String(row.minStockBase ?? 0),
    });
    setImageFile(null);
    setOpenDialog(true);
  };

  const onSave = async () => {
    if (!form.name.trim() || !form.baseUnitId) {
      toast({ message: "Nombre y unidad son obligatorios.", variant: "warning" });
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name.trim());
    if (form.sku) fd.append("sku", form.sku.trim());
    if (form.categoryId) fd.append("categoryId", form.categoryId);
    if (form.brandId) fd.append("brandId", form.brandId);
    fd.append("baseUnitId", form.baseUnitId);
    if (form.sizeLabel) fd.append("sizeLabel", form.sizeLabel.trim());
    fd.append("salePrice", form.salePrice || "0");
    fd.append("stockBase", form.stockBase || "0");
    fd.append("minStockBase", form.minStockBase || "0");
    if (imageFile) fd.append("image", imageFile);

    const isEdit = Boolean(editing?.id);
    try {
      await withMutationToast(toast, {
        promise: isEdit ? updateProduct(editing.id, fd) : createProduct(fd),
        onSuccess: async () => {
          setOpenDialog(false);
          await loadAll();
        },
      });
    } catch {
      /* toast mostró error */
    }
  };

  const addBrand = async () => {
    if (!newBrand.trim()) return;
    try {
      await withMutationToast(toast, {
        promise: createBrand({ name: newBrand.trim() }),
        onSuccess: async () => {
          setNewBrand("");
          const { data } = await getBrands();
          setBrands(data || []);
        },
      });
    } catch {
      /* toast mostró error */
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Productos
      </Typography>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" onClick={openNew}>
          Nuevo producto
        </Button>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {products.slice(0, 8).map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p.id}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              {p.primaryImageUrl && (
                <CardMedia component="img" height={120} image={buildImageUrl(p.primaryImageUrl)} alt={p.name} />
              )}
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${Number(p.salePrice).toFixed(2)}
                </Typography>
                <Chip size="small" label={`Stock: ${p.stockBase}`} sx={{ mt: 1 }} color={p.stockBase <= p.minStockBase ? "warning" : "default"} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TablePro
        title="Catálogo completo"
        rows={products}
        columns={[
          { id: "id", label: "ID" },
          { id: "name", label: "Producto" },
          { id: "sku", label: "SKU" },
          { id: "cat", label: "Categoría", render: (r) => r.category?.name || "—" },
          { id: "brand", label: "Marca", render: (r) => r.brand?.name || "—" },
          { id: "unit", label: "Unidad", render: (r) => r.baseUnit?.abbreviation || "—" },
          { id: "salePrice", label: "Precio", render: (r) => `$${Number(r.salePrice).toFixed(2)}` },
          { id: "stockBase", label: "Stock" },
          {
            id: "edit",
            label: "",
            render: (r) => (
              <Button size="small" onClick={() => openEdit(r)}>
                Editar
              </Button>
            ),
          },
        ]}
        showSearch
        showPagination
        showIndex
        tableMaxHeight={360}
      />

      <SimpleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        tittle={editing ? "Editar producto" : "Nuevo producto"}
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Nombre *" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="SKU" value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Medidas / tamaño" value={form.sizeLabel} onChange={(e) => setForm((s) => ({ ...s, sizeLabel: e.target.value }))} placeholder="ej. 2m x 1m" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth size="small" label="Categoría" value={form.categoryId} onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}>
              <MenuItem value="">—</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth size="small" label="Marca" value={form.brandId} onChange={(e) => setForm((s) => ({ ...s, brandId: e.target.value }))}>
              <MenuItem value="">—</MenuItem>
              {brands.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth size="small" label="Unidad *" value={form.baseUnitId} onChange={(e) => setForm((s) => ({ ...s, baseUnitId: e.target.value }))}>
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name} ({u.abbreviation})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Precio venta" type="number" value={form.salePrice} onChange={(e) => setForm((s) => ({ ...s, salePrice: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Stock" type="number" value={form.stockBase} onChange={(e) => setForm((s) => ({ ...s, stockBase: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Stock mínimo" type="number" value={form.minStockBase} onChange={(e) => setForm((s) => ({ ...s, minStockBase: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" component="label" size="small">
              {imageFile ? imageFile.name : "Subir foto"}
              <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </Button>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField fullWidth size="small" label="Nueva marca" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="outlined" onClick={addBrand}>
              + Marca
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={onSave}>
              Guardar producto
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
    </Box>
  );
}
