export const MODULES_PROJECT = [
  {
    name: "auth",
    description: "Autenticación",
    routes: ["/login"],
  },
  {
    name: "publico",
    description: "Páginas públicas",
    routes: ["/home", "/info", "/donaciones"],
  },
  {
    name: "panel",
    description: "Panel principal",
    routes: ["/dashboard"],
  },
  {
    name: "inventario",
    description: "Gestión de inventario",
    routes: ["/productos", "/categorias", "/proveedores", "/unidades"],
  },
  {
    name: "ventas",
    description: "Clientes, pedidos, caja y ventas",
    routes: ["/clientes", "/pedidos", "/caja", "/ventas"],
  },
  {
    name: "movimientos",
    description: "Movimientos de stock",
    routes: ["/movimientos"],
  },
  {
    name: "administracion",
    description: "Administración del sistema",
    routes: ["/panel_control", "/logs", "/usuarios", "/cuentas", "/config-app"],
  },
  {
    name: "herramientas",
    description: "Herramientas y utilidades",
    routes: ["/comandos", "/documentacion", "/img-manager", "/archivos"],
  },
  {
    name: "perfil",
    description: "Notificaciones y perfil",
    routes: ["/notifications", "/perfil", "/info-negocio"],
  },
];
