import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { MODULES_PROJECT } from "../constants/modules-project";

export default function NoSubscriptionPage() {
  const navigate = useNavigate();
  const { isLoading, subscription } = useSubscriptions();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={64} />
      </Box>
    );
  }

  const enabledModules = subscription?.subscription?.modules?.map((m) => m.key) || [];
  const modules = MODULES_PROJECT.filter((m) => enabledModules.includes(m.name));

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <LockIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Sin acceso
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          El módulo al que intentas acceder no está incluido en tu plan actual.
          Revisa los módulos habilitados a continuación.
        </Typography>

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Módulos habilitados en tu plan
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
