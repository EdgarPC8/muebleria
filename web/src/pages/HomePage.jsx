/**
 * Panel principal tras login: resumen financiero del negocio.
 */
import { Box, Typography } from "@mui/material";
import BusinessOverviewChart from "../components/BusinessOverviewChart.jsx";
import FinanceDashboard from "../components/FinanceDashboard.jsx";

export default function HomePage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom color="primary">
        Panel Calva Cueva
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Finanzas, panorama del negocio y movimiento del sistema.
      </Typography>
      <FinanceDashboard />
      <BusinessOverviewChart />
    </Box>
  );
}
