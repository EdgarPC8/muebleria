/**
 * Unidades de medida (grupos y factor a unidad base).
 */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import { createUnit, getUnits, updateUnit } from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

const GROUP_PRESETS = [
  { value: "unit", label: "Pieza — unidad, juego, par, set" },
  { value: "length", label: "Longitud — metro, centímetro" },
  { value: "area", label: "Superficie — metro cuadrado (m²)" },
];

const GROUP_SHORT = { unit: "Pieza", length: "Longitud", area: "Superficie" };

const INITIAL_FORM = {
  name: "",
  abbreviation: "",
  groupName: "unit",
  factorToBase: "1",
  isBase: false,
};

export default function UnidadesPage() {
  const { toast } = useAuth();
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadData = async () => {
    const { data } = await getUnits();
    setUnits(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = useMemo(
    () => [
      { id: "id", label: "ID" },
      { id: "name", label: "Nombre" },
      { id: "abbreviation", label: "Abrev." },
      {
        id: "groupName",
        label: "Grupo",
        render: (r) => GROUP_SHORT[r.groupName] || r.groupName,
      },
      { id: "factorToBase", label: "Factor" },
      { id: "isBase", label: "Base", render: (r) => (r.isBase ? "Sí" : "No") },
      {
        id: "acc",
        label: "",
        render: (r) => (
          <Button size="small" onClick={() => openEdit(r)}>
            Editar
          </Button>
        ),
      },
    ],
    [],
  );

  const openNew = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setOpenDialog(true);
  };

  const openEdit = (unit) => {
    setEditing(unit);
    setForm({
      name: unit.name || "",
      abbreviation: unit.abbreviation || "",
      groupName: unit.groupName || "unit",
      factorToBase: String(unit.factorToBase ?? "1"),
      isBase: Boolean(unit.isBase),
    });
    setOpenDialog(true);
  };

  const onSave = async () => {
    const f = Number(form.factorToBase);
    if (!form.name.trim() || !form.abbreviation.trim()) {
      toast({
        message: "Nombre y abreviatura son obligatorios.",
        variant: "warning",
      });
      return;
    }
    if (!Number.isFinite(f) || f <= 0) {
      toast({ message: "Factor debe ser mayor que 0.", variant: "warning" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      abbreviation: form.abbreviation.trim(),
      groupName: form.groupName,
      factorToBase: f,
      isBase: form.isBase,
    };
    try {
      await withMutationToast(toast, {
        promise: editing
          ? updateUnit(editing.id, payload)
          : createUnit(payload),
        onSuccess: async () => {
          setForm(INITIAL_FORM);
          setEditing(null);
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
        Unidades de medida
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Para mueblería usa <strong>piezas</strong> (und, juego, par) o{" "}
        <strong>medidas</strong> (m, m²). No se usan libras ni gramos.
      </Alert>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" onClick={openNew}>
          Nueva unidad
        </Button>
      </Paper>
      <TablePro
        title="Listado"
        rows={units}
        columns={columns}
        showSearch
        showPagination
        showIndex
        tableMaxHeight={400}
      />
      <SimpleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={editing ? "Editar unidad" : "Nueva unidad"}
        fullWidth
        maxWidth="sm"
      >
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Grupo"
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
            >
              {GROUP_PRESETS.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Abreviatura"
              value={form.abbreviation}
              onChange={(e) =>
                setForm({ ...form, abbreviation: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Factor a base"
              type="number"
              value={form.factorToBase}
              onChange={(e) =>
                setForm({ ...form, factorToBase: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isBase}
                  onChange={(e) =>
                    setForm({ ...form, isBase: e.target.checked })
                  }
                />
              }
              label="Unidad base del grupo"
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" onClick={onSave}>
              Guardar
            </Button>
          </Grid>
        </Grid>
      </SimpleDialog>
    </Box>
  );
}
