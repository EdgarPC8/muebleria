/**
 * Diagrama ER generado desde el backend: tarjetas por tabla y vista de relaciones.
 */
import { useEffect, useId, useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
//import mermaid from "mermaid";
import { getDatabaseSchema } from "../api/muebleriaRequest.js";

function TableCard({ table }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 200,
        maxWidth: 320,
        borderRadius: 2,
        overflow: "hidden",
        borderColor: "primary.main",
        borderWidth: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 1.5,
          py: 0.75,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          noWrap
          title={table.name}
        >
          {table.name}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {table.columns.length} columnas
        </Typography>
      </Box>
      <Table size="small">
        <TableBody>
          {table.columns.map((col) => (
            <TableRow
              key={col.name}
              sx={{
                "&:nth-of-type(even)": { bgcolor: "action.hover" },
                ...(col.primaryKey && { bgcolor: "rgba(255, 193, 7, 0.12)" }),
              }}
            >
              <TableCell sx={{ py: 0.4, pl: 1, width: 52, border: 0 }}>
                {col.primaryKey ? (
                  <Chip
                    label="PK"
                    size="small"
                    color="warning"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                ) : col.foreignKey ? (
                  <Chip
                    label="FK"
                    size="small"
                    color="info"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                ) : null}
              </TableCell>
              <TableCell
                sx={{
                  py: 0.4,
                  border: 0,
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.72rem",
                }}
              >
                {col.name}
              </TableCell>
              <TableCell
                sx={{
                  py: 0.4,
                  pr: 1,
                  border: 0,
                  color: "text.secondary",
                  fontSize: "0.68rem",
                  maxWidth: 100,
                }}
                align="right"
              >
                {col.type}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {table.columns.some((c) => c.foreignKey) ? (
        <Box
          sx={{
            px: 1,
            py: 0.75,
            bgcolor: "action.selected",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {table.columns
            .filter((c) => c.foreignKey)
            .map((c) => (
              <Typography
                key={c.name}
                variant="caption"
                display="block"
                color="info.main"
              >
                {c.name} → {c.foreignKey}
              </Typography>
            ))}
        </Box>
      ) : null}
    </Paper>
  );
}

function GroupSection({ group, tablesByName }) {
  const groupTables = group.tables
    .map((name) => tablesByName[name])
    .filter(Boolean);
  if (groupTables.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        color="primary.main"
        gutterBottom
      >
        {group.label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {groupTables.map((t) => (
          <TableCard key={t.name} table={t} />
        ))}
      </Box>
    </Box>
  );
}

function MermaidDiagram({ code }) {
  const containerRef = useRef(null);
  const renderId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!code || !containerRef.current) return;
    let cancelled = false;

    const run = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "neutral",
          er: { useMaxWidth: true },
        });
        const { svg } = await mermaid.render(`er-${renderId}`, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML =
            '<p style="color:#b71c1c;padding:1rem">No se pudo dibujar el diagrama. Usa la vista «Tablas».</p>';
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [code, renderId]);

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, overflow: "auto", bgcolor: "background.paper" }}
    >
      <Box
        ref={containerRef}
        sx={{ minHeight: 320, "& svg": { maxWidth: "100%", height: "auto" } }}
      />
    </Paper>
  );
}

export default function DatabaseSchemaDiagram() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schema, setSchema] = useState(null);
  const [view, setView] = useState("tablas");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getDatabaseSchema();
        if (!cancelled) setSchema(res.data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.message ||
              "No se pudo cargar el esquema de la base de datos.",
          );
          setSchema(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tablesByName = {};
  if (schema?.tables) {
    for (const t of schema.tables) tablesByName[t.name] = t;
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Alert severity="success" sx={{ mb: 2 }}>
        Esquema leído desde los <strong>modelos del backend</strong> (MySQL{" "}
        <strong>muebleria</strong>).
        {schema ? (
          <>
            {" "}
            {schema.tableCount} tablas · {schema.relationCount} relaciones.
          </>
        ) : null}
      </Alert>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : schema ? (
        <>
          <Paper variant="outlined" sx={{ mb: 2 }}>
            <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ px: 1 }}>
              <Tab label="Tablas y columnas" value="tablas" />
              <Tab label="Diagrama de relaciones" value="diagrama" />
              <Tab label="Lista de relaciones" value="relaciones" />
            </Tabs>
          </Paper>

          {view === "tablas" &&
            schema.groups.map((g) => (
              <GroupSection key={g.id} group={g} tablesByName={tablesByName} />
            ))}

          {view === "diagrama" ? (
            <MermaidDiagram code={schema.mermaidEr} />
          ) : null}

          {view === "relaciones" ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Desde (tabla.columna)</TableCell>
                    <TableCell />
                    <TableCell>Hacia (tabla)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schema.relations.map((r, i) => (
                    <TableRow key={i} hover>
                      <TableCell
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {r.fromTable}.{r.fromColumn}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        →
                      </TableCell>
                      <TableCell
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {r.toTable}.{r.toColumn}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
