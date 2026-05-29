/**
 * Documento de trabajo en equipo — vista en app.
 * Ruta: /muebleria/comandos/prueba
 */
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function DocTable({ title, headers, rows }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {headers.map((h) => (
                <TableCell key={h} sx={{ color: "primary.contrastText", fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} sx={{ "&:nth-of-type(even)": { bgcolor: "action.hover" } }}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

const GITHUB = "https://github.com/EdgarPC8/muebleria.git";
const DBDIAGRAM = "https://dbdiagram.io/d/Diagrama-Muebleria-6a19ed5a2eeb2f46cd1c9563";

export default function PruebaPage() {
  const { user } = useAuth();

  if (user?.loginRol !== "Programador") {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", pb: 4 }}>
      <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
        DOCUMENTO DE TRABAJO EN EQUIPO
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Proyecto Mueblería — Comercial Calva Cueva
      </Typography>

      <DocTable
        title="Información general"
        headers={["Campo", "Valor"]}
        rows={[
          ["Equipo", "Patricio Briceño, Edgar Torres"],
          ["Fecha de inicio", "29/05/26"],
          ["Última actualización", "29/05/26"],
          ["Versión del documento", "1.0"],
        ]}
      />

      <DocTable
        title="1. Objetivo del proyecto"
        headers={["Ítem", "Descripción"]}
        rows={[
          [
            "Qué hacemos",
            "Sistema Mueblería: catálogo, clientes, proveedores, notificaciones, respaldos JSON y panel administrativo (Comercial Calva Cueva).",
          ],
          ["Alcance actual", "Backend API + Aplicación Web React, Móvil y de Escritorio"],
          ["Pendiente", "Aplicación móvil (appMovil) y aplicación de escritorio (appDesktop)"],
        ]}
      />

      <DocTable
        title="2. Recursos y enlaces principales"
        headers={["Recurso", "Enlace"]}
        rows={[
          [
            "Repositorio GitHub",
            <Link href={GITHUB} target="_blank" rel="noopener">
              {GITHUB}
            </Link>,
          ],
          [
            "Diagrama base de datos",
            <Link href={DBDIAGRAM} target="_blank" rel="noopener">
              {DBDIAGRAM}
            </Link>,
          ],
        ]}
      />

      <DocTable
        title="3. Estructura del repositorio"
        headers={["Carpeta", "Descripción", "Estado", "Responsable"]}
        rows={[
          ["backend/", "API Node.js + MySQL, puerto 3007, prefijo muebleriaapi", "En uso", "Equipo"],
          ["web/", "React + Vite, puerto 5174, ruta /muebleria/", "En uso", "Edgar"],
          ["appMovil/", "Aplicación móvil", "Pendiente", "Patricio"],
          ["appDesktop/", "Aplicación de escritorio", "Pendiente", "Pendiente"],
        ]}
      />

      <Typography variant="body1" fontWeight={600}>
        Base de datos: muebleria
      </Typography>
    </Box>
  );
}
