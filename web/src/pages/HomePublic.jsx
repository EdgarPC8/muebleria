/**
 * Landing pública de Comercial Calva Cueva (sin sesión o enlace al panel).
 */
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WeekendIcon from "@mui/icons-material/Weekend";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useAuth } from "../context/AuthContext.jsx";
import { LOGO_PATH } from "../config.js";
import { buildImageUrl } from "../api/axios.js";

const PROMOS = [
  {
    title: "Salas y comedores",
    desc: "Diseños modernos para tu hogar",
    badge: "Nuevo",
  },
  {
    title: "Colchones y dormitorio",
    desc: "Descanso con garantía",
    badge: "Oferta",
  },
  { title: "Muebles de cocina", desc: "Armados a medida", badge: "Consultar" },
];

export default function HomePublic() {
  const theme = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();
  const loggedIn = isAuthenticated && Boolean(user?.loginRol);

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "background.default" }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`,
          color: "#fff",
          py: { xs: 5, md: 7 },
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5} sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.15),
                  boxShadow: `0 0 40px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={buildImageUrl("/branding/logo-negocio.png")}
                  alt="Comercial Calva Cueva"
                  sx={{
                    width: { xs: 160, md: 200 },
                    height: { xs: 160, md: 200 },
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))",
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography
                variant="overline"
                sx={{ opacity: 0.9, letterSpacing: 3 }}
              >
                Comercial Calva Cueva
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ mb: 1.5, lineHeight: 1.15 }}
              >
                Muebles para tu hogar y negocio
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.92, maxWidth: 520, mb: 3 }}
              >
                Calidad, variedad y atención personalizada. Explora promociones
                o ingresa al sistema de gestión.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {!isLoading && !loggedIn && (
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      fontWeight: 700,
                      "&:hover": { bgcolor: theme.palette.secondary.dark },
                    }}
                  >
                    Iniciar sesión
                  </Button>
                )}
                {!isLoading && loggedIn && (
                  <Button
                    component={RouterLink}
                    to="/"
                    variant="contained"
                    size="large"
                    startIcon={<DashboardIcon />}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      fontWeight: 700,
                      "&:hover": { bgcolor: theme.palette.secondary.dark },
                    }}
                  >
                    Ir al panel
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  href="#promos"
                  sx={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff" }}
                >
                  Ver promociones
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }} id="promos">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <LocalOfferIcon color="secondary" />
          <Typography variant="h5" fontWeight={800}>
            Destacados
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          {PROMOS.map((p) => (
            <Grid item xs={12} sm={4} key={p.title}>
              <Paper variant="panel" sx={{ p: 2.5, height: "100%" }}>
                <Chip
                  label={p.badge}
                  color="secondary"
                  size="small"
                  sx={{ mb: 1, fontWeight: 700 }}
                />
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <WeekendIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    {p.title}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {p.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
        >
          <Button
            component={RouterLink}
            to="/info"
            size="small"
            color="inherit"
          >
            Info del sistema
          </Button>
          <Button
            component={RouterLink}
            to="/donaciones"
            size="small"
            color="inherit"
          >
            Donaciones
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
