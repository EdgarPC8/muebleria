/**
 * Edición de configuración de la app (BD). Solo Programador.
 */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  getAppSettingsRequest,
  updateAppSettingsRequest,
  uploadAppLogoRequest,
} from "../api/appSettingsRequest.js";
import { buildImageUrl } from "../api/axios.js";
import { LOGO_PATH } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ConfigAppPage() {
  const { user, toast } = useAuth();
  const [form, setForm] = useState({
    appName: "",
    version: "",
    description: "",
    authors: "",
    logoPath: "",
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAppSettingsRequest();
      setForm({
        appName: data.appName || "",
        version: data.version || "",
        description: data.description || "",
        authors: data.authors || "",
        logoPath: data.logoPath || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.loginRol === "Programador") load();
  }, [user?.loginRol]);

  if (user?.loginRol !== "Programador") {
    return <Navigate to="/" replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    try {
      await toast({ promise: updateAppSettingsRequest(form) });
      await load();
    } catch {
      /* toast */
    }
  };

  const onLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await toast({ promise: uploadAppLogoRequest(file) });
      await load();
    } catch {
      /* toast */
    }
    e.target.value = "";
  };

  const logoUrl = buildImageUrl(form.logoPath) || LOGO_PATH;

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Configuración del sistema
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Estos datos se guardan en la base de datos y se muestran en la pantalla <strong>Info</strong>.
      </Alert>

      {loading ? (
        <Typography color="text.secondary">Cargando…</Typography>
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Box
              component="img"
              src={logoUrl}
              alt="Logo"
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: 3,
                borderColor: "primary.main",
              }}
            />
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Subir logo
              <input type="file" hidden accept="image/*" onChange={onLogoFile} />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Ruta en servidor: {form.logoPath || "—"}
            </Typography>
          </Stack>

          <TextField label="Nombre de la aplicación" fullWidth value={form.appName} onChange={set("appName")} />
          <TextField label="Versión" fullWidth sx={{ mt: 2 }} value={form.version} onChange={set("version")} />
          <TextField
            label="Descripción"
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
            value={form.description}
            onChange={set("description")}
          />
          <TextField label="Creadores / autores" fullWidth sx={{ mt: 2 }} value={form.authors} onChange={set("authors")} />
          <TextField
            label="Ruta del logo (relativa /img)"
            fullWidth
            sx={{ mt: 2 }}
            value={form.logoPath}
            onChange={set("logoPath")}
            helperText="Ej: branding/logo-calva-cueva.png — también puedes subir logo arriba"
          />

          <Button variant="contained" startIcon={<SaveIcon />} sx={{ mt: 3 }} onClick={save}>
            Guardar configuración
          </Button>
        </Paper>
      )}
    </Box>
  );
}
