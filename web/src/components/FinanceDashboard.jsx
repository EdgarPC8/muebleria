/**
 * Resumen financiero: KPIs y gráficas para el panel principal.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { getFinanceSummary } from "../api/muebleriaRequest.js";
import { buildRangeParams, money, RANGE_OPTIONS } from "../utils/panelDashboardUtils.js";

const CHART_COLORS = ["#2e7d32", "#1565c0", "#ed6c02", "#9c27b0", "#d32f2f", "#00838f"];

function KpiCard({ title, value, subtitle, icon: Icon, color = "primary.main" }) {
  return (
    <Paper
      variant="panel"
      sx={{
        containerType: "inline-size",
        p: { xs: 1.25, md: 1.5 },
        height: "100%",
        minWidth: 0,
        borderLeft: 4,
        borderColor: color,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        {Icon ? (
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              color,
              display: "flex",
              flexShrink: 0,
              "@container (max-width: 140px)": { display: "none" },
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1, width: "100%" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ lineHeight: 1.3, mb: 0.25 }}
          >
            {title}
          </Typography>
          <Typography
            component="p"
            fontWeight={800}
            sx={{
              m: 0,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontSize: "clamp(0.65rem, 11cqw, 1.05rem)",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
          {subtitle ? (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.35, lineHeight: 1.25, fontSize: "clamp(0.6rem, 8cqw, 0.75rem)" }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}

function ChartPanel({ title, subtitle, children }) {
  return (
    <Paper variant="panel" sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: 240 }}>{children}</Box>
    </Paper>
  );
}

export default function FinanceDashboard() {
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getFinanceSummary(buildRangeParams(range));
      setSummary(res.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo cargar el resumen financiero.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const rangeLabel = RANGE_OPTIONS.find((o) => o.key === range)?.label || range;
  const breakdown = summary?.breakdown || {};
  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpense = Number(summary?.totalExpense || 0);
  const balance = Number(summary?.balance ?? totalIncome - totalExpense);
  const expectedCash = Number(summary?.expectedCash || 0);
  const debts = Number(summary?.debts || 0);

  const incomePie = useMemo(() => {
    const sales = Number(breakdown.salesIncome || 0);
    const manual = Number(breakdown.manualIncome || 0);
    return [
      { id: "ventas", label: "Ventas", value: sales },
      { id: "manual", label: "Manuales", value: manual },
    ].filter((x) => x.value > 0);
  }, [breakdown]);

  const expensePie = useMemo(() => {
    const purchases = Number(breakdown.purchasesExpense || 0);
    const manual = Number(breakdown.manualExpense || 0);
    const supplier = Number(breakdown.supplierOrdersExpense || 0);
    return [
      { id: "compras", label: "Compras", value: purchases },
      { id: "proveedores", label: "Pedidos proveedor", value: supplier },
      { id: "manual", label: "Gastos manuales", value: manual },
    ].filter((x) => x.value > 0);
  }, [breakdown]);

  const daily = summary?.dailySeries || { labels: [], income: [], expense: [] };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Finanzas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumen del negocio · período: {rangeLabel}
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          value={range}
          exclusive
          onChange={(_, v) => v && setRange(v)}
        >
          {RANGE_OPTIONS.map((o) => (
            <ToggleButton key={o.key} value={o.key}>
              {o.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={() => void loadSummary()}>Reintentar</Button>}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: { xs: 1.5, md: 2 },
              mb: 3,
              width: "100%",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(5, minmax(0, 1fr))",
              },
            }}
          >
            <KpiCard
              title="Ingresos"
              value={money(totalIncome)}
              subtitle={`Ventas: ${money(breakdown.salesIncome)}`}
              icon={TrendingUpIcon}
              color="success.main"
            />
            <KpiCard
              title="Gastos"
              value={money(totalExpense)}
              subtitle={`Compras: ${money(breakdown.purchasesExpense)}`}
              icon={TrendingDownIcon}
              color="error.main"
            />
            <KpiCard
              title="Total dinero"
              value={money(balance)}
              subtitle={balance >= 0 ? "Balance +" : "Balance −"}
              icon={AccountBalanceWalletIcon}
              color={balance >= 0 ? "primary.main" : "warning.main"}
            />
            <KpiCard
              title="Dinero esperado"
              value={money(expectedCash)}
              subtitle="Por cobrar"
              icon={PaymentsIcon}
              color="info.main"
            />
            <KpiCard
              title="Deudas"
              value={money(debts)}
              subtitle="Por pagar"
              icon={CreditCardIcon}
              color="warning.main"
            />
          </Box>

          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
            Gráficas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <ChartPanel title="Origen de ingresos" subtitle="Ventas vs registros manuales">
                {incomePie.length > 0 ? (
                  <PieChart
                    width={280}
                    height={240}
                    series={[
                      {
                        data: incomePie,
                        innerRadius: 48,
                        outerRadius: 90,
                        paddingAngle: 3,
                        arcLabel: (item) => (item.value > 0 ? money(item.value) : ""),
                        arcLabelMinAngle: 12,
                      },
                    ]}
                    colors={CHART_COLORS}
                    slotProps={{ legend: { hidden: true } }}
                  />
                ) : (
                  <Typography color="text.secondary">Sin ingresos en el período</Typography>
                )}
              </ChartPanel>
            </Grid>
            <Grid item xs={12} md={4}>
              <ChartPanel title="Origen de gastos" subtitle="Compras, proveedores y manuales">
                {expensePie.length > 0 ? (
                  <PieChart
                    width={280}
                    height={240}
                    series={[
                      {
                        data: expensePie,
                        innerRadius: 48,
                        outerRadius: 90,
                        paddingAngle: 3,
                        arcLabel: (item) => (item.value > 0 ? money(item.value) : ""),
                        arcLabelMinAngle: 12,
                      },
                    ]}
                    colors={CHART_COLORS}
                    slotProps={{ legend: { hidden: true } }}
                  />
                ) : (
                  <Typography color="text.secondary">Sin gastos en el período</Typography>
                )}
              </ChartPanel>
            </Grid>
            <Grid item xs={12} md={4}>
              <ChartPanel title="Balance visual" subtitle="Ingresos vs gastos del período">
                <PieChart
                  width={280}
                  height={240}
                  series={[
                    {
                      data: [
                        { id: "ing", label: "Ingresos", value: totalIncome },
                        { id: "gas", label: "Gastos", value: totalExpense },
                      ].filter((x) => x.value > 0),
                      innerRadius: 52,
                      outerRadius: 88,
                      arcLabel: (item) => money(item.value),
                    },
                  ]}
                  colors={["#2e7d32", "#d32f2f"]}
                  slotProps={{ legend: { hidden: true } }}
                />
              </ChartPanel>
            </Grid>
            <Grid item xs={12}>
              <ChartPanel title="Ingresos y gastos por día" subtitle="Últimos 14 días con actividad">
                {daily.labels?.length > 0 ? (
                  <BarChart
                    width={Math.min(900, typeof window !== "undefined" ? window.innerWidth - 80 : 900)}
                    height={280}
                    series={[
                      { data: daily.income, label: "Ingresos", color: "#2e7d32" },
                      { data: daily.expense, label: "Gastos", color: "#d32f2f" },
                    ]}
                    xAxis={[{ scaleType: "band", data: daily.labels }]}
                    margin={{ left: 56, right: 16, top: 24, bottom: 48 }}
                  />
                ) : (
                  <Typography color="text.secondary">Sin datos diarios</Typography>
                )}
              </ChartPanel>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
