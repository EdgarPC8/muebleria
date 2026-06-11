import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import { getAppSettingsRequest } from "../api/appSettingsRequest.js";
import { getMuebleriaInfoRequest } from "../api/muebleriaInfoRequest.js";
import { buildImageUrl } from "../api/axios.js";
import { LOGO_PATH } from "../config.js";

export default function InfoPage() {
  const [info, setInfo] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAppSettingsRequest()
        .then((r) => r.data)
        .catch(() => null),
      getMuebleriaInfoRequest()
        .then((r) => r.data)
        .catch(() => null),
    ])
      .then(([appInfo, bizInfo]) => {
        setInfo(appInfo);
        setBusiness(bizInfo);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const appLogo = buildImageUrl(info?.logoPath) || LOGO_PATH;
  const businessLogo = business?.logoPath
    ? buildImageUrl(business.logoPath)
    : null;
  const year = new Date().getFullYear();

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <Paper
        elevation={3}
        sx={{ maxWidth: 560, width: "100%", p: 4, borderRadius: 3 }}
      >
        {business && (
          <>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
            >
              {businessLogo && (
                <Box
                  component="img"
                  src={businessLogo}
                  alt={business.businessName}
                  sx={{
                    width: 90,
                    height: 90,
                    mb: 2,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: 3,
                    borderColor: "primary.main",
                  }}
                />
              )}
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <StorefrontIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                {business.businessName || "Comercial Calva Cueva"}
              </Typography>
            </Box>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {business.ownerName && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">{business.ownerName}</Typography>
                </Box>
              )}
              {business.ruc && (
                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon fontSize="small" color="action" />
                  <Typography variant="body2">RUC: {business.ruc}</Typography>
                </Box>
              )}
              {business.address && (
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {business.address}
                    {business.city ? `, ${business.city}` : ""}
                  </Typography>
                </Box>
              )}
              {business.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {business.phone}
                    {business.secondaryPhone
                      ? ` / ${business.secondaryPhone}`
                      : ""}
                  </Typography>
                </Box>
              )}
              {business.email && (
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{business.email}</Typography>
                </Box>
              )}
              {business.openingHours && (
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {business.openingHours}
                  </Typography>
                </Box>
              )}
            </Stack>
            {business.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {business.description}
              </Typography>
            )}
          </>
        )}

        <Divider sx={{ my: 3 }} />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          {/* <Typography variant="h5" fontWeight="bold" gutterBottom> */}
          {/*   {info?.appName || "Sistema gestor de inventario"} */}
          {/* </Typography> */}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Versión {info?.version || "—"}
          </Typography>

          <Typography variant="body1" gutterBottom sx={{ lineHeight: 1.7 }}>
            {info?.description || "Sistema de gestión de inventario."}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © {year} {info?.authors || "Equipo"} — Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
}
