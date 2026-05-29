/**
 * Categorías de producto (árbol padre/hijo).
 */
import { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, TextField, Button, MenuItem } from "@mui/material";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import { createCategory, getCategories } from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

export default function CategoriasPage() {
  const { toast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const loadData = async () => {
    const { data } = await getCategories();
    setCategories(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreate = async () => {
    if (!name.trim()) {
      toast({ message: "El nombre es obligatorio.", variant: "warning" });
      return;
    }
    try {
      await withMutationToast(toast, {
        promise: createCategory({
          name: name.trim(),
          description: description.trim() || null,
          parentId: parentId || null,
        }),
        onSuccess: async () => {
          setName("");
          setDescription("");
          setParentId("");
          setOpenDialog(false);
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
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
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
          { id: "parent", label: "Padre", render: (r) => r.parent?.name || "—" },
        ]}
        showSearch
        showPagination
        showIndex
        tableMaxHeight={440}
      />
      <SimpleDialog open={openDialog} onClose={() => setOpenDialog(false)} tittle="Nueva categoría" fullWidth maxWidth="md">
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={5}>
            <TextField fullWidth size="small" label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth size="small" label="Padre" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <MenuItem value="">Raíz</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={onCreate}>
              Guardar
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
    </Box>
  );
}
