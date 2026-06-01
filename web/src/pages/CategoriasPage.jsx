import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

const EMPTY_FORM = { name: "", description: "", parentId: "" };

export default function CategoriasPage() {
  const { toast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadData = async () => {
    const { data } = await getCategories();
    setCategories(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCategories = categories.filter((c) => c.isActive !== false);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      parentId: cat.parentId || "",
    });
    setOpenDialog(true);
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast({ message: "El nombre es obligatorio.", variant: "warning" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      parentId: form.parentId || null,
    };
    try {
      await withMutationToast(toast, {
        promise: editing
          ? updateCategory(editing.id, payload)
          : createCategory(payload),
        onSuccess: async () => {
          setForm(EMPTY_FORM);
          setEditing(null);
          setOpenDialog(false);
          await loadData();
        },
      });
    } catch {
      /* toast mostró error */
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await withMutationToast(toast, {
        promise: deleteCategory(deleting.id),
        onSuccess: async () => {
          setDeleting(null);
          setOpenConfirm(false);
          await loadData();
        },
      });
    } catch {
      /* toast mostró error */
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Categorías
      </Typography>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" onClick={openNew}>
          Nueva categoría
        </Button>
      </Paper>
      <TablePro
        title="Listado"
        rows={categories}
        columns={[
          { id: "id", label: "ID" },
          { id: "name", label: "Nombre" },
          { id: "slug", label: "Slug" },
          {
            id: "parent",
            label: "Padre",
            render: (r) => r.parent?.name || "—",
          },
          {
            id: "isActive",
            label: "Estado",
            render: (r) => (r.isActive !== false ? "Activa" : "Inactiva"),
          },
          {
            id: "acc",
            label: "",
            render: (r) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button size="small" onClick={() => openEdit(r)}>
                  Editar
                </Button>
                {r.isActive !== false && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setDeleting(r);
                      setOpenConfirm(true);
                    }}
                  >
                    Desactivar
                  </Button>
                )}
              </Box>
            ),
          },
        ]}
        showSearch
        showPagination
        showIndex
        tableMaxHeight={440}
      />
      <SimpleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={editing ? "Editar categoría" : "Nueva categoría"}
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              label="Nombre *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Padre"
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <MenuItem value="">Raíz</MenuItem>
              {activeCategories
                .filter((c) => !editing || c.id !== editing.id)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Descripción"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={onSave}>
              Guardar
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
      <SimpleDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Desactivar categoría"
        message={`¿Desactivar "${deleting?.name}"? Quedará oculta pero los productos asociados no se eliminan.`}
        onClickAccept={onDelete}
      />
    </Box>
  );
}
