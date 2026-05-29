/**
 * Gráfica de barras: cantidad de registros por módulo del negocio.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { getDashboardStats } from "../api/muebleriaRequest.js";

const OVERVIEW_META = [
  { key: "categories", label: "Categorías", color: "#1565c0" },
  { key: "products", label: "Productos", color: "#2e7d32" },
  { key: "customers", label: "Clientes", color: "#6a1b9a" },
  { key: "suppliers", label: "Proveedores", color: "#ef6c00" },
  { key: "customerOrders", label: "Pedidos clientes", color: "#00838f" },
  { key: "supplierOrders", label: "Pedidos proveedor", color: "#c62828" },
  { key: "brands", label: "Marcas", color: "#5d4037" },
  { key: "movements", label: "Movimientos", color: "#455a64" },
];

export default function BusinessOverviewChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardStats();
      setStats(res.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudieron cargar los conteos.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return { labels: [], values: [], colors: [] };
    const labels = [];
    const values = [];
    const colors = [];
    for (const row of OVERVIEW_META) {
      const n = Number(stats[row.key] ?? 0);
      labels.push(row.label);
      values.push(n);
      colors.push(row.color);
    }
    return { labels, values, colors };
  }, [stats]);

  const totalRecords = chartData.values.reduce((a, b) => a + b, 0);

  return (
    <Paper variant="panel" sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
        Panorama del negocio
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cantidad de registros en cada módulo · total: {totalRecords}
      </Typography>

      {error ? (
        <Alert severity="error" action={<Button onClick={() => void load()}>Reintentar</Button>}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={7}>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <BarChart
                height={320}
                colors={chartData.colors}
                xAxis={[
                  {
                    scaleType: "band",
                    data: chartData.labels,
                    tickLabelStyle: { fontSize: 11 },
                    height: 72,
                  },
                ]}
                yAxis={[{ label: "Cantidad", width: 48 }]}
                series={[
                  {
                    data: chartData.values,
                    label: "Registros",
                  },
                ]}
                margin={{ left: 56, right: 16, top: 24, bottom: 80 }}
                barLabel="value"
                slotProps={{
                  bar: { rx: 4 },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Stack spacing={1}>
              {OVERVIEW_META.map((row) => {
                const n = Number(stats?.[row.key] ?? 0);
                const pct = totalRecords > 0 ? ((n / totalRecords) * 100).toFixed(1) : "0";
                return (
                  <Stack
                    key={row.key}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      py: 0.75,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: row.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {n}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40, textAlign: "right" }}>
                      {pct}%
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
