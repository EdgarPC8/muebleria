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
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import {
  getMuebleriaInfoRequest,
  updateMuebleriaInfoRequest,
  uploadMuebleriaLogoRequest,
} from "../api/muebleriaInfoRequest.js";
import { buildImageUrl } from "../api/axios.js";
import { LOGO_PATH } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

const sectionStyle = { bgcolor: "grey.50", borderRadius: 2, p: 3 };

export default function MuebleriaInfoPage() {
  const { user, toast } = useAuth();
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    ruc: "",
    address: "",
    phone: "",
    secondaryPhone: "",
    email: "",
    openingHours: "",
    city: "",
    description: "",
    logoPath: "",
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMuebleriaInfoRequest();
      setForm({
        businessName: data.businessName || "",
        ownerName: data.ownerName || "",
        ruc: data.ruc || "",
        address: data.address || "",
        phone: data.phone || "",
        secondaryPhone: data.secondaryPhone || "",
        email: data.email || "",
        openingHours: data.openingHours || "",
        city: data.city || "",
        description: data.description || "",
        logoPath: data.logoPath || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.loginRol === "Administrador") load();
  }, [user?.loginRol]);

  if (user?.loginRol !== "Administrador") {
    return <Navigate to="/" replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    try {
      await toast({ promise: updateMuebleriaInfoRequest(form) });
      await load();
    } catch {
      /* toast */
    }
  };

  const onLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await toast({ promise: uploadMuebleriaLogoRequest(file) });
      await load();
    } catch {
      /* toast */
    }
    e.target.value = "";
  };

  const logoUrl = buildImageUrl(form.logoPath) || LOGO_PATH;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="text.secondary">Cargando…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        <StorefrontIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Información del negocio
      </Typography>
      {/* <Alert severity="info" sx={{ mb: 3 }}> */}
      {/*   Estos datos se muestran en la pantalla <strong>Info</strong> pública. */}
      {/*   Solo el rol <strong>Programador</strong> puede editarlos. */}
      {/* </Alert> */}

      <Stack spacing={3}>
        <Paper variant="outlined" sx={sectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <StorefrontIcon color="primary" />
            Logo del negocio
          </Typography>
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Avatar
              src={logoUrl}
              alt={form.businessName}
              sx={{
                width: 100,
                height: 100,
                border: 3,
                borderColor: "primary.main",
                bgcolor: "grey.200",
              }}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Cambiar logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={onLogoFile}
                />
              </Button>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                PNG, JPG o WebP • Se reemplaza automáticamente
              </Typography>
              {form.logoPath && (
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Ruta: {form.logoPath}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={sectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <ContactMailIcon color="primary" />
            Datos generales
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre del negocio"
                fullWidth
                value={form.businessName}
                onChange={set("businessName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dueño / Propietario"
                fullWidth
                value={form.ownerName}
                onChange={set("ownerName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="RUC"
                fullWidth
                value={form.ruc}
                onChange={set("ruc")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ciudad"
                fullWidth
                value={form.city}
                onChange={set("city")}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={sectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <LocationOnIcon color="primary" />
            Ubicación
          </Typography>
          <TextField
            label="Dirección"
            fullWidth
            value={form.address}
            onChange={set("address")}
          />
        </Paper>

        <Paper variant="outlined" sx={sectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <PersonIcon color="primary" />
            Contacto
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono principal"
                fullWidth
                value={form.phone}
                onChange={set("phone")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono secundario"
                fullWidth
                value={form.secondaryPhone}
                onChange={set("secondaryPhone")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Correo electrónico"
                fullWidth
                type="email"
                value={form.email}
                onChange={set("email")}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={sectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <AccessTimeIcon color="primary" />
            Horarios
          </Typography>
          <TextField
            label="Horarios de atención"
            fullWidth
            value={form.openingHours}
            onChange={set("openingHours")}
            helperText="Ej: Lun–Vie 8:00–18:00, Sáb 8:00–13:00"
          />
        </Paper>

        <Paper variant="outlined" sx={sectionStyle}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <DescriptionIcon color="primary" />
            Descripción
          </Typography>
          <TextField
            label="Descripción del negocio"
            fullWidth
            multiline
            minRows={3}
            value={form.description}
            onChange={set("description")}
          />
        </Paper>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={save}
          >
            Guardar información
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
