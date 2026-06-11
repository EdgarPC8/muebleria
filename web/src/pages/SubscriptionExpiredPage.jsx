import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { activateSubscription } from "../api/subscriptionsRequest";
import { MODULES_PROJECT } from "../constants/modules-project";

export default function SubscriptionExpiredPage() {
  const navigate = useNavigate();
  const { isLoading, subscription } = useSubscriptions();
  const [licenseKey, setLicenseKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    setActivating(true);
    setError("");
    try {
      await activateSubscription(licenseKey.trim());
      setSuccess(true);
      setTimeout(() => navigate("/inicio"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al activar la licencia");
    } finally {
      setActivating(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={64} />
      </Box>
    );
  }

  const enabledModules =
    subscription?.subscription?.modules?.map((m) => m.key) || [];
  const modules = MODULES_PROJECT.filter((m) =>
    enabledModules.includes(m.name),
  );

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Suscripción expirada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Tu plan ya no está activo. Algunos módulos podrían no estar
          disponibles.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Ingresa una licencia para reactivar o comunícate con el administrador.
        </Typography>

        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Licencia activada correctamente. Recargando...
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Pegar licencia"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
              />
              <Button
                variant="contained"
                onClick={handleActivate}
                disabled={activating || !licenseKey.trim()}
                startIcon={
                  activating ? <CircularProgress size={18} /> : <VpnKeyIcon />
                }
              >
                Activar
              </Button>
            </Stack>
          </>
        )}

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Módulos del plan anterior
        </Typography>

        <Stack spacing={1} sx={{ mb: 4, textAlign: "left" }}>
          {modules.map((mod) => (
            <Box
              key={mod.name}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              <CheckCircleIcon color="success" fontSize="small" />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {mod.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {mod.routes.join(" · ")}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
        >
          Ir al inicio
        </Button>
      </Paper>
    </Container>
  );
}
