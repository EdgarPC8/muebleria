/**
 * Proveedores: registro y listado.
 */
import { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import { createSupplier, getSuppliers } from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

export default function ProveedoresPage() {
  const { toast } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", document: "", address: "", note: "" });
  const [openDialog, setOpenDialog] = useState(false);

  const load = async () => {
    const res = await getSuppliers();
    setSuppliers(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    if (!form.name.trim()) {
      toast({ message: "El nombre del proveedor es obligatorio.", variant: "warning" });
      return;
    }
    try {
      await withMutationToast(toast, {
        promise: createSupplier({
          name: form.name.trim(),
          phone: form.phone?.trim() || null,
          document: form.document?.trim() || null,
          address: form.address?.trim() || null,
          note: form.note?.trim() || null,
        }),
        onSuccess: async () => {
          setForm({ name: "", phone: "", document: "", address: "", note: "" });
          setOpenDialog(false);
          await load();
        },
      });
    } catch {
      /* toast mostró error */
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Proveedores
      </Typography>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Nuevo proveedor
        </Button>
      </Paper>
      <TablePro
        title="Listado"
        rows={suppliers}
        columns={[
          { id: "id", label: "ID" },
          { id: "name", label: "Proveedor" },
          { id: "phone", label: "Teléfono" },
          { id: "document", label: "RUC/Doc" },
          { id: "address", label: "Dirección" },
        ]}
        showSearch
        showPagination
        showIndex
        defaultRowsPerPage={10}
        tableMaxHeight={480}
      />
      <SimpleDialog open={openDialog} onClose={() => setOpenDialog(false)} title="Nuevo proveedor" fullWidth maxWidth="md">
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Nombre *" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Teléfono" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Documento" value={form.document} onChange={(e) => setForm((s) => ({ ...s, document: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Dirección" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Notas" value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" fullWidth onClick={onSave}>
              Guardar
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
    </Box>
  );
}
