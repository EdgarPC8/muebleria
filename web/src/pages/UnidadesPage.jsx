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
import { createUnit, getUnits } from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { withMutationToast } from "../utils/mutationToast.js";

const GROUP_PRESETS = [
  { value: "unit", label: "Pieza — unidad, juego, par, set" },
  { value: "length", label: "Longitud — metro, centímetro" },
  { value: "area", label: "Superficie — metro cuadrado (m²)" },
];

const GROUP_SHORT = { unit: "Pieza", length: "Longitud", area: "Superficie" };

export default function UnidadesPage() {
  const { toast } = useAuth();
  const [units, setUnits] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [groupName, setGroupName] = useState("unit");
  const [factorToBase, setFactorToBase] = useState("1");
  const [isBase, setIsBase] = useState(false);

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
      { id: "groupName", label: "Grupo", render: (r) => GROUP_SHORT[r.groupName] || r.groupName },
      { id: "factorToBase", label: "Factor" },
      { id: "isBase", label: "Base", render: (r) => (r.isBase ? "Sí" : "No") },
    ],
    []
  );

  const onCreate = async () => {
    const f = Number(factorToBase);
    if (!name.trim() || !abbreviation.trim()) {
      toast({ message: "Nombre y abreviatura son obligatorios.", variant: "warning" });
      return;
    }
    if (!Number.isFinite(f) || f <= 0) {
      toast({ message: "Factor debe ser mayor que 0.", variant: "warning" });
      return;
    }
    try {
      await withMutationToast(toast, {
        promise: createUnit({
          name: name.trim(),
          abbreviation: abbreviation.trim(),
          groupName,
          factorToBase: f,
          isBase,
        }),
        onSuccess: async () => {
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
        Para mueblería usa <strong>piezas</strong> (und, juego, par) o <strong>medidas</strong> (m, m²). No se usan
        libras ni gramos.
      </Alert>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Nueva unidad
        </Button>
      </Paper>
      <TablePro title="Listado" rows={units} columns={columns} showSearch showPagination showIndex tableMaxHeight={400} />
      <SimpleDialog open={openDialog} onClose={() => setOpenDialog(false)} title="Nueva unidad" fullWidth maxWidth="sm">
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField select fullWidth size="small" label="Grupo" value={groupName} onChange={(e) => setGroupName(e.target.value)}>
              {GROUP_PRESETS.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Abreviatura" value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Factor a base" type="number" value={factorToBase} onChange={(e) => setFactorToBase(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel control={<Switch checked={isBase} onChange={(e) => setIsBase(e.target.checked)} />} label="Unidad base del grupo" />
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
