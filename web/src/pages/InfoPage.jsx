/**
 * Información del sistema: nombre, versión y creadores (desde BD).
 */
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Divider, CircularProgress } from "@mui/material";
import { getAppSettingsRequest } from "../api/appSettingsRequest.js";
import { buildImageUrl } from "../api/axios.js";
import { LOGO_PATH } from "../config.js";

export default function InfoPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppSettingsRequest()
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const logo = buildImageUrl(info?.logoPath) || LOGO_PATH;
  const year = new Date().getFullYear();

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 520, width: "100%", p: 4, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Box
            component="img"
            src={logo}
            alt={info?.appName || "App"}
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              borderRadius: "50%",
              objectFit: "cover",
              border: 3,
              borderColor: "primary.main",
              boxShadow: 2,
            }}
          />

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {info?.appName || "Mueblería Calva Cueva"}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Versión {info?.version || "—"}
          </Typography>

          <Divider sx={{ my: 2, width: "100%" }} />

          <Typography variant="body1" gutterBottom sx={{ lineHeight: 1.7 }}>
            {info?.description || "Sistema de gestión de inventario."}
          </Typography>

          {info?.authors && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Desarrollado por {info.authors}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" mt={2}>
            © {year} {info?.authors || "Equipo"} — Todos los derechos reservados.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
