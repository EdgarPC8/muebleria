/**
 * Documentación del proyecto: Recursos (Programador), Módulos (descripción por sección) y Propuesta comercial.
 */
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Link,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import DatabaseSchemaDiagram from "../components/DatabaseSchemaDiagram.jsx";

const GITHUB = "https://github.com/EdgarPC8/muebleria.git";

const ALLOWED = new Set(["Programador", "Administrador"]);

function DocTable({ title, headers, rows }) {
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
          {title}
        </Typography>
      )}
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

function SectionText({ title, children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Box>
  );
}

function RecursosTab() {
  return (
    <Box sx={{ pt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Referencia técnica para el equipo de desarrollo. Enlaces, entorno, rutas y convenciones.
        También existe <strong>DOCUMENTO_EQUIPO_MUEBLERIA.html</strong> en la raíz del repositorio.
      </Alert>

      <DocTable
        title="Información general"
        headers={["Campo", "Valor"]}
        rows={[
          ["Equipo", "Patricio Briceño, Edgar Torres"],
          ["Fecha de inicio", "29/05/2026"],
          ["Última actualización", "29/05/2026"],
          ["Versión del documento", "1.3"],
        ]}
      />

      <DocTable
        title="Enlaces principales"
        headers={["Recurso", "Enlace"]}
        rows={[
          [
            "Repositorio GitHub",
            <Link href={GITHUB} target="_blank" rel="noopener">
              {GITHUB}
            </Link>,
          ],
          ["Diagrama BD en la app", "Documentación → pestaña Diagrama BD (generado desde el backend)"],
        ]}
      />

      <DocTable
        title="Estructura del repositorio"
        headers={["Carpeta", "Descripción", "Estado", "Responsable"]}
        rows={[
          ["backend/", "API Node.js + MySQL, puerto 3007, prefijo muebleriaapi", "En uso", "Equipo"],
          ["web/", "React + Vite, puerto 5174, ruta /muebleria/", "En uso", "Edgar"],
          ["appMovil/", "Aplicación móvil", "Pendiente", "Patricio"],
          ["appDesktop/", "Aplicación de escritorio", "Pendiente", "Pendiente"],
        ]}
      />

      <DocTable
        title="Entorno de desarrollo"
        headers={["Herramienta", "Uso"]}
        rows={[
          ["Node.js", "Runtime backend y frontend"],
          ["npm", "Dependencias y scripts"],
          ["MySQL", "Base de datos muebleria"],
          ["Git", "Control de versiones"],
          ["Cursor / VS Code", "Editor"],
        ]}
      />

      <DocTable
        title="Comandos de arranque"
        headers={["Paso", "Comando"]}
        rows={[
          [
            "Crear base de datos",
            "CREATE DATABASE muebleria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
          ],
          ["Backend", "cd backend → npm install → npm run dev"],
          ["Frontend", "cd web → npm install → npm run dev"],
        ]}
      />

      <DocTable
        title="Acceso de prueba"
        headers={["Dato", "Valor"]}
        rows={[
          ["Usuario inicial", "administrador"],
          ["Contraseña", "Ver backend/src/database/backup.json"],
          ["Config API", "web/src/api/axios.js → API_ENV: local / server / production"],
        ]}
      />

      <DocTable
        title="Convenciones Git"
        headers={["Regla", "Detalle"]}
        rows={[
          ["Antes de trabajar", "git pull"],
          ["Ramas", "Una rama por funcionalidad o rama compartida acordada"],
          ["Commits", "Mensajes claros (ej.: feat: notificaciones)"],
          ["No subir", ".env, contraseñas, node_modules"],
          ["Integrar a main", "Revisar en GitHub antes de fusionar"],
        ]}
      />

      <DocTable
        title="Rutas web (desarrollo local)"
        headers={["Pantalla", "Ruta", "Roles"]}
        rows={[
          ["Inicio público", "/muebleria/home", "Todos"],
          ["Login", "/muebleria/login", "Todos"],
          ["Panel principal", "/muebleria/", "Autenticados (finanzas + panorama)"],
          ["Caja / POS", "/muebleria/caja", "Admin / Empleado"],
          ["Productos", "/muebleria/productos", "Según permisos"],
          ["Clientes", "/muebleria/clientes", "Según permisos"],
          ["Pedidos (calendario)", "/muebleria/pedidos", "Admin / Empleado"],
          ["Movimientos", "/muebleria/movimientos", "Admin / Empleado"],
          ["Info (pública)", "/muebleria/info", "Todos"],
          ["Donaciones", "/muebleria/donaciones", "Todos"],
          ["Usuarios / Cuentas", "/muebleria/usuarios, /cuentas", "Admin / Programador"],
          ["Panel control JSON", "/muebleria/panel_control", "Admin / Programador"],
          ["Config. sistema", "/muebleria/config-app", "Solo Programador"],
          ["Imágenes", "/muebleria/img-manager", "Solo Programador"],
          ["Archivos", "/muebleria/archivos", "Solo Programador"],
          ["Comandos BD", "/muebleria/comandos", "Solo Programador"],
          ["Documentación", "/muebleria/documentacion", "Admin / Programador"],
        ]}
      />

      <DocTable
        title="API — configuración y archivos"
        headers={["Recurso", "Endpoint", "Roles"]}
        rows={[
          ["Config app (lectura)", "GET /muebleriaapi/app-settings", "Público"],
          ["Config app (edición)", "PUT /muebleriaapi/app-settings", "Programador"],
          ["Logo", "POST /muebleriaapi/app-settings/logo", "Programador"],
          ["Imágenes", "/muebleriaapi/img (scan, upload, delete, zip)", "Programador"],
          ["Documentos", "/muebleriaapi/files (scan, upload, delete, download, zip)", "Programador"],
        ]}
      />

      <DocTable
        title="Base de datos"
        headers={["Concepto", "Valor"]}
        rows={[
          ["Motor", "MySQL"],
          ["Nombre", "muebleria"],
          ["Config app", "Tabla app_settings (fila única id=1: appName, version, description, authors, logoPath)"],
          ["Diagrama ER", "Documentación → Diagrama BD (API GET /muebleria/database/schema)"],
          ["Total tablas", "25 (9 sistema + 16 mueblería, según modelos Sequelize)"],
        ]}
      />

      <DocTable
        title="Respaldos JSON"
        headers={["Acción", "Ubicación", "Quién"]}
        rows={[
          ["Guardar / descargar", "Panel de control", "Admin, Programador"],
          ["Subir / recargar BD", "Comandos", "Solo Programador"],
          [
            "Datos de prueba",
            "backend/src/database/backup.json (usuarios, catálogo, pedidos)",
            "Ver clave _comentarios en el JSON",
          ],
        ]}
      />
    </Box>
  );
}

/** Descripción funcional de cada módulo del sistema (Admin y Programador). */
function ModulosTab() {
  return (
    <Box sx={{ pt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Referencia rápida de qué hace cada sección del menú. Se ampliará con capturas y flujos detallados.
      </Alert>

      <SectionText title="Usuarios">
        Registro de personas del negocio: nombres, cédula, fecha de nacimiento y datos de contacto.
        Un usuario puede tener una o varias cuentas de acceso. Solo Admin y Programador pueden crear o editar.
      </SectionText>

      <SectionText title="Roles">
        Define el nivel de acceso en el sistema: <strong>Programador</strong> (técnico, comandos, config),
        <strong> Administrador</strong> (gestión completa del negocio) y <strong>Empleado</strong> (operación diaria:
        productos, clientes, pedidos). Una cuenta puede tener varios roles y cambiar el activo desde el menú de usuario.
      </SectionText>

      <SectionText title="Cuentas">
        Credenciales de login (usuario y contraseña) vinculadas a un registro de Usuario y a uno o más Roles.
        Desde aquí se asignan permisos sin duplicar datos personales.
      </SectionText>

      <SectionText title="Pedidos">
        Vista unificada con calendario mensual: pedidos de clientes (ventas) y pedidos a proveedores (compras).
        Filtros Todos / Clientes / Proveedores. Al seleccionar un día se despliega el detalle con acciones de
        marcar entregado/recibido y pagado. Ruta: <strong>/pedidos</strong>.
      </SectionText>

      <SectionText title="Movimientos de inventario">
        Kardex de stock: cada entrada (compras, ajustes), salida (ventas entregadas) y ajuste manual queda registrado
        con producto, cantidad, costo y referencia al pedido origen. Ruta: <strong>/movimientos</strong>.
        Admin y Programador pueden registrar ajustes manuales de entrada o salida.
      </SectionText>

      <SectionText title="Notificaciones">
        Avisos en tiempo real para usuarios autenticados (campana del menú). Incluye notificaciones manuales y programadas
        (bienvenida, actualizaciones, horarios). Los programas se configuran en la sección de programas de notificación.
      </SectionText>

      <SectionText title="Productos, categorías, clientes y proveedores">
        Catálogo e inventario del negocio. Categorías organizan el catálogo; unidades definen cómo se mide el stock;
        proveedores abastecen mercadería. Los datos iniciales de prueba se cargan desde backup.json al recargar la BD.
      </SectionText>
    </Box>
  );
}

function PropuestaTab({ isProgramador }) {
  return (
    <Box sx={{ pt: 2 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        Propuesta y alcance acordado con <strong>Mueblería Calva Cueva</strong>. Vista orientada al
        negocio, sin detalle de implementación.
        {isProgramador && " Para referencia técnica, use la pestaña Recursos."}
      </Alert>

      <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
        Propuesta de alcance
      </Typography>

      <SectionText title="1. Objetivo del sistema">
        Desarrollar un sistema de gestión y control de inventario que permita registrar entradas y
        salidas de productos, con generación de reportes, para optimizar la administración del local
        Mueblería Calva Cueva.
      </SectionText>

      <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 3, mb: 1 }}>
        2. Panorama
      </Typography>

      <SectionText title="2.1 Acerca del negocio">
        Mueblería Calva Cueva es un negocio dedicado a la venta de muebles. Actualmente detalla su
        operación de inventario mediante hojas de cálculo en Excel.
      </SectionText>

      <SectionText title="2.2 Estado actual">
        El control de inventario se realiza en Excel. Las entradas y salidas de muebles son
        registradas manualmente por los propietarios o asistentes de almacén. La generación de
        reportes financieros y de inventario requiere revisión manual, lo que consume tiempo y
        aumenta el riesgo de errores.
      </SectionText>

      <DocTable
        title="2.3 Problemas identificados"
        headers={["Problema", "Descripción"]}
        rows={[
          [
            "Fragilidad de la información",
            "Las hojas de cálculo son vulnerables a corrupción, eliminación accidental o pérdida de datos.",
          ],
          [
            "Verificación humana",
            "El cuadre de inventario depende completamente de la supervisión humana, con mayor riesgo de error.",
          ],
          [
            "Falta de trazabilidad",
            "No hay un historial estructurado de quién realizó cada modificación o movimiento.",
          ],
          [
            "Retraso en reportes",
            "Los reportes requieren procesos manuales que retrasan la información y pueden desactualizarla.",
          ],
          [
            "Dificultad para el crecimiento",
            "Al aumentar productos y clientes, administrar todo en Excel se vuelve más complejo.",
          ],
        ]}
      />

      <DocTable
        title="3. Actores"
        headers={["Actor", "Descripción"]}
        rows={[
          [
            "Propietarios (2)",
            "Administran el sistema, consultan reportes, gestionan usuarios y supervisan las operaciones del negocio.",
          ],
          [
            "Asistentes de almacén",
            "Registran entradas y salidas de inventario, consultan existencias y mantienen actualizada la información de productos.",
          ],
        ]}
      />

      <DocTable
        title="4. Módulos del sistema"
        headers={["Módulo", "Características", "Descripción de entrega", "Monto (USD)"]}
        rows={[
          [
            "Módulo 1: Gestión de usuarios y permisos",
            <>
              • Crear usuarios (propietarios)
              <br />
              • Roles con permisos diferenciados
              <br />• Autenticación segura (usuario y contraseña)
            </>,
            "Crear y gestionar usuarios, control de roles y acceso protegido al sistema.",
            "100",
          ],
          [
            "Módulo 2: Gestión y control de inventario",
            <>
              • Stock en tiempo real
              <br />
              • Entradas y salidas con trazabilidad
            </>,
            "Control de stock actualizado y registro de cada movimiento de inventario.",
            "300",
          ],
          [
            "Módulo 3: Reportes (inventario y financiero)",
            <>
              1. Inventario: total de muebles, existencias y precio por ítem
              <br />
              2. Financiero: ingresos, egresos y fecha de cada transacción
            </>,
            "Documentos claros del estado del inventario y del flujo económico del negocio.",
            "250",
          ],
          [
            "Módulo 4: Gestión de clientes",
            <>
              • Registrar clientes
              <br />• Historial de compras
            </>,
            "Administración de clientes e historial de compras por cliente.",
            "200",
          ],
        ]}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: "italic" }}>
        Inversión total referencial de módulos listados: USD 850.
      </Typography>

      <DocTable
        title="5. Detalles técnicos (resumen)"
        headers={["Aspecto", "Detalle"]}
        rows={[
          ["Frontend", "React + Vite (aplicación web)"],
          ["Backend", "Node.js + Express (API REST)"],
          ["Base de datos", "MySQL centralizada"],
          ["Autenticación", "JWT"],
          ["Control de versiones", "Git y GitHub"],
          ["Arquitectura", "Cliente-servidor: navegador ↔ API ↔ base de datos"],
          ["Compatibilidad", "Google Chrome, Microsoft Edge, Mozilla Firefox"],
        ]}
      />

      <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 2, mb: 1 }}>
        6. Fuera de alcance y supuestos
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 260 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Fuera de alcance
          </Typography>
          <List dense disablePadding>
            {[
              "Aplicación móvil",
              "Aplicación de escritorio",
              "Facturación electrónica",
              "Integración con el SRI",
              "Pasarelas de pago",
              "Integración con WhatsApp",
              "Módulo de proveedores (si no está incluido en el acuerdo)",
            ].map((t) => (
              <ListItem key={t} disableGutters sx={{ py: 0.25 }}>
                <ListItemText primary={`• ${t}`} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 260 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Supuestos
          </Typography>
          <List dense disablePadding>
            {[
              "El cliente proporcionará la información inicial de productos.",
              "El cliente contará con conexión a internet.",
              "El cliente designará usuarios responsables para pruebas y validación.",
            ].map((t) => (
              <ListItem key={t} disableGutters sx={{ py: 0.25 }}>
                <ListItemText primary={`• ${t}`} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      <DocTable
        title="7. Soporte"
        headers={["Incluido", "No incluido"]}
        rows={[
          [
            <>
              • Corrección de errores del desarrollo
              <br />
              • Asistencia básica de uso
              <br />• Soporte remoto 30 días post-entrega
            </>,
            <>
              • Nuevos módulos
              <br />
              • Cambios mayores en funcionalidades aprobadas
              <br />• Integraciones externas no contempladas
            </>,
          ],
        ]}
      />
    </Box>
  );
}

export default function DocumentacionPage() {
  const { user } = useAuth();
  const isProgramador = user?.loginRol === "Programador";

  const defaultTab = useMemo(() => "diagrama", []);
  const [tab, setTab] = useState(defaultTab);

  if (!ALLOWED.has(user?.loginRol)) {
    return <Navigate to="/" replace />;
  }

  const wideLayout = tab === "diagrama";

  return (
    <Box sx={{ maxWidth: wideLayout ? 1280 : 960, mx: "auto", pb: 4 }}>
      <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
        Documentación
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        Mueblería Calva Cueva
      </Typography>

      <Paper variant="outlined" sx={{ mb: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}
        >
          <Tab label="Diagrama BD" value="diagrama" />
          {isProgramador && <Tab label="Recursos" value="recursos" />}
          <Tab label="Módulos" value="modulos" />
          <Tab label="Documentación" value="propuesta" />
        </Tabs>
      </Paper>

      {tab === "diagrama" ? <DatabaseSchemaDiagram /> : null}
      {tab === "recursos" && isProgramador ? <RecursosTab /> : null}
      {tab === "modulos" ? <ModulosTab /> : null}
      {tab === "propuesta" ? <PropuestaTab isProgramador={isProgramador} /> : null}
    </Box>
  );
}
