/** Comandos admin: backup y recarga BD; mensajes desde muebleriaapi. */
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  CardActions,
  useTheme,
  Tooltip,
  Alert,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Link as RouterLink } from "react-router-dom";
import ScienceIcon from "@mui/icons-material/Science";
import { reloadBD, saveBackup, downloadBackup, uploadBackup } from "../api/comandsRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const COMMANDS = [
  {
    key: "upload",
    name: "Subir backup.json",
    info: "Reemplaza backup.json en el servidor (luego usa Recargar BD)",
    icon: UploadFileIcon,
    run: (toast) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("backup", file);
        toast({ promise: uploadBackup(fd) });
      };
      input.click();
    },
  },
  {
    key: "download",
    name: "Descargar backup.json",
    info: "Descarga el estado actual de la base en JSON",
    icon: BackupIcon,
    run: (toast) =>
      toast({ promise: downloadBackup() }),
  },
  {
    key: "reload",
    name: "Recargar BD",
    info: "Borra y vuelve a crear tablas desde backup.json",
    icon: RefreshIcon,
    run: (toast) => {
      if (
        !window.confirm(
          "¿Recargar la base de datos desde backup.json? Se borrarán todos los datos actuales."
        )
      ) {
        return;
      }
      toast({ promise: reloadBD() });
    },
  },
  {
    key: "save",
    name: "Guardar copia en servidor",
    info: "Guarda backup.json y copia con fecha en /backups",
    icon: SaveIcon,
    run: (toast) =>
      toast({ promise: saveBackup() }),
  },
];

export default function ComandosPage() {
  const theme = useTheme();
  const { user, toast } = useAuth();

  if (user?.loginRol !== "Programador") {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Comandos — Programador
        </Typography>
        <Button
          component={RouterLink}
          to="/comandos/prueba"
          variant="outlined"
          startIcon={<ScienceIcon />}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Comandos / Prueba
        </Button>
      </Box>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Recargar BD elimina todos los datos actuales y los restaura desde <strong>backup.json</strong>.
        Úsalo con precaución. El documento del equipo (tablas) está en{" "}
        <strong>Comandos / Prueba</strong>.
      </Alert>
      <Grid container spacing={2}>
        {COMMANDS.map((cmd) => {
          const Icon = cmd.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={cmd.key}>
              <Card
                variant="panel"
                sx={{
                  height: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent>
                  <Box sx={{ color: "primary.main", mb: 1 }}>
                    <Icon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {cmd.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cmd.info}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title={cmd.info}>
                    <Button fullWidth variant="contained" onClick={() => cmd.run(toast)}>
                      Ejecutar
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
