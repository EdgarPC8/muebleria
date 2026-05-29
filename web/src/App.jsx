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
import PanelControlPage from "./pages/PanelControlPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<NavBar />}>
          <Route path="/home" element={<HomePublic />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/inicio" element={<HomePublic />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/proveedores" element={<ProveedoresPage />} />
            <Route path="/unidades" element={<UnidadesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/comandos" element={<ComandosPage />} />
            <Route path="/panel_control" element={<PanelControlPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}
