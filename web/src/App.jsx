/**
 * Definición de rutas de la app web (públicas, protegidas y panel admin).
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import PublicOnlyRoute from "./context/PublicOnlyRoute.jsx";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/Login.jsx";
import HomePublic from "./pages/HomePublic.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductosPage from "./pages/ProductosPage.jsx";
import CategoriasPage from "./pages/CategoriasPage.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import ProveedoresPage from "./pages/ProveedoresPage.jsx";
import UnidadesPage from "./pages/UnidadesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ComandosPage from "./pages/ComandosPage.jsx";
import DocumentacionPage from "./pages/DocumentacionPage.jsx";
import PanelControlPage from "./pages/PanelControlPage.jsx";
import LogsPage from "./pages/LogsPage.jsx";
import CuentasPage from "./pages/CuentasPage.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import DonacionesPage from "./pages/DonacionesPage.jsx";
import MueblesPage from "./pages/MueblesPage.jsx";
import ConfigAppPage from "./pages/ConfigAppPage.jsx";
import MuebleriaInfoPage from "./pages/MuebleriaInfoPage.jsx";
import ImgManagerPage from "./pages/ImgManagerPage.jsx";
import ArchivosPage from "./pages/ArchivosPage.jsx";
import PedidosPage from "./pages/PedidosPage.jsx";
import MovimientosPage from "./pages/MovimientosPage.jsx";
import CajaPage from "./pages/CajaPage.jsx";
import VentasPage from "./pages/VentasPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import NoSubscriptionPage from "./pages/NoSubscriptionPage.jsx";
import SubscriptionExpiredPage from "./pages/SubscriptionExpiredPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<NavBar />}>
          <Route path="/inicio" element={<HomePublic />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/muebles" element={<MueblesPage />} />
          <Route path="/donaciones" element={<DonacionesPage />} />

          <Route path="/no-subscription" element={<NoSubscriptionPage />} />
          <Route path="/subscription-expired" element={<SubscriptionExpiredPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/inicio" element={<HomePublic />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/caja" element={<CajaPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route
              path="/pedidos-clientes"
              element={<Navigate to="/pedidos" replace />}
            />
            <Route
              path="/pedidos-proveedores"
              element={<Navigate to="/pedidos" replace />}
            />
            <Route path="/proveedores" element={<ProveedoresPage />} />
            <Route path="/unidades" element={<UnidadesPage />} />
            <Route path="/movimientos" element={<MovimientosPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/comandos" element={<ComandosPage />} />
            <Route path="/documentacion" element={<DocumentacionPage />} />
            <Route
              path="/comandos/prueba"
              element={<Navigate to="/documentacion" replace />}
            />
            <Route path="/panel_control" element={<PanelControlPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/cuentas" element={<CuentasPage />} />
            <Route path="/config-app" element={<ConfigAppPage />} />
            <Route path="/info-negocio" element={<MuebleriaInfoPage />} />
            <Route path="/img-manager" element={<ImgManagerPage />} />
            <Route path="/archivos" element={<ArchivosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </AuthProvider>
  );
}
