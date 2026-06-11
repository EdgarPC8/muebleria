/**
 * Envuelve rutas que requieren sesión; redirige a login si no hay token.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./AuthContext.jsx";
import { useSubscriptions } from "../hooks/useSubscriptions.js";
import { MODULES_PROJECT } from "../constants/modules-project.js";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isLoading: isLoadingSub, subscription } = useSubscriptions();
  const location = useLocation();

  if (isLoading || isLoadingSub) {
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

  if (!isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (!user?.loginRol) {
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

  if (!subscription.subscribed) {
    return <Navigate to="/subscription-expired" replace />;
  }

  const module = MODULES_PROJECT.filter((e) =>
    e.routes.includes(location.pathname),
  );

  const hasAccess =
    module.length &&
    subscription?.subscription.modules?.find((m) => m.key === module[0].name);

  if (!hasAccess) {
    return <Navigate to="/no-subscription" replace />;
  }

  return <Outlet />;
}
