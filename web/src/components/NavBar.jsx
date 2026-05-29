import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  CircularProgress,
  styled,
  useTheme,
  Badge,
  Popover,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StraightenIcon from "@mui/icons-material/Straighten";
import LogoutIcon from "@mui/icons-material/Logout";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TerminalIcon from "@mui/icons-material/Terminal";
import DnsIcon from "@mui/icons-material/Dns";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import NotificationList from "./NotificationList.jsx";
import CambiarRol from "./CambiarRol.jsx";
import SimpleDialog from "./Dialogs/SimpleDialog.jsx";
import { getUnreadCount } from "../api/notificationsRequest.js";
import { useNotificationSocket } from "../hooks/useNotificationSocket.js";
import { LOGO_PATH } from "../config.js";

const DRAWER_W = 260;

const MENU_CATALOG = [
  { name: "Panel", link: "/", icon: <DashboardIcon />, roles: ["Programador", "Administrador", "Empleado"] },
  { name: "Productos", link: "/productos", icon: <InventoryIcon />, roles: ["Programador", "Administrador", "Empleado"] },
  { name: "Categorías", link: "/categorias", icon: <CategoryIcon />, roles: ["Programador", "Administrador"] },
  { name: "Clientes", link: "/clientes", icon: <PeopleIcon />, roles: ["Programador", "Administrador", "Empleado"] },
  { name: "Proveedores", link: "/proveedores", icon: <LocalShippingIcon />, roles: ["Programador", "Administrador"] },
  { name: "Unidades", link: "/unidades", icon: <StraightenIcon />, roles: ["Programador", "Administrador"] },
  { name: "Notificaciones", link: "/notifications", icon: <NotificationsIcon />, roles: ["Programador", "Administrador", "Empleado"] },
  { name: "Panel de control", link: "/panel_control", icon: <DnsIcon />, roles: ["Programador", "Administrador"] },
  { name: "Comandos", link: "/comandos", icon: <TerminalIcon />, roles: ["Programador"] },
];

function menuForRole(loginRol) {
  if (!loginRol) return [];
  return MENU_CATALOG.filter((m) => m.roles.includes(loginRol));
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function NavBar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userAnchor, setUserAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [openChangeRol, setOpenChangeRol] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const hasMultipleRoles = (user?.roles?.length ?? 0) > 1;

  const profileReady = Boolean(user?.loginRol);
  const showDrawer = isAuthenticated && profileReady;
  const showUserActions = isAuthenticated && profileReady;
  const profileLoading = isAuthenticated && !profileReady;

  const displayName =
    [user?.firstName, user?.firstLastName].filter(Boolean).join(" ") || user?.username || "";

  const pagesToShow = useMemo(() => menuForRole(user?.loginRol), [user?.loginRol]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await getUnreadCount(user.userId);
      setUnreadCount(res.data?.count ?? 0);
    } catch {
      /* ignore */
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useNotificationSocket(user?.userId, user?.accountId, () => {
    fetchUnreadCount();
  });

  const drawerContent = (
    <>
      <DrawerHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, px: 1 }}>
          <Box
            component="img"
            src={LOGO_PATH}
            alt="Calva Cueva"
            sx={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", bgcolor: "primary.main" }}
          />
          {drawerOpen && (
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              Calva Cueva
            </Typography>
          )}
        </Box>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {pagesToShow.map((item) => (
          <ListItemButton
            key={item.link}
            selected={location.pathname === item.link}
            onClick={() => navigate(item.link)}
            sx={{ borderRadius: 2, mb: 0.5, justifyContent: drawerOpen ? "initial" : "center" }}
          >
            <Tooltip title={!drawerOpen ? item.name : ""} placement="right">
              <ListItemIcon sx={{ minWidth: drawerOpen ? 40 : "auto", justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            {drawerOpen && <ListItemText primary={item.name} />}
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          ...(showDrawer &&
            drawerOpen && {
              ml: `${DRAWER_W}px`,
              width: `calc(100% - ${DRAWER_W}px)`,
            }),
        }}
      >
        <Toolbar>
          {showDrawer && !drawerOpen && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" fontWeight={700} noWrap sx={{ mr: 2 }}>
            {showUserActions ? user?.loginRol : "Comercial Calva Cueva"}
          </Typography>

          {showUserActions && (
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/inicio")}
              sx={{ textTransform: "none", fontWeight: 600, mr: 1 }}
            >
              Inicio
            </Button>
          )}

          {!showUserActions && !profileLoading && (
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/home")}
              sx={{ textTransform: "none", fontWeight: 600, mr: 1 }}
            >
              Inicio
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <ThemeSwitcher />

          {profileLoading && <CircularProgress size={22} color="inherit" sx={{ ml: 2 }} />}

          {!showUserActions && !profileLoading && !isAuthenticated && !isLoading && (
            <Button
              variant="outlined"
              color="inherit"
              sx={{ ml: 2, textTransform: "none", fontWeight: 700, borderColor: "rgba(255,255,255,0.5)" }}
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </Button>
          )}

          {showUserActions && (
            <>
              <IconButton
                color="inherit"
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                disabled={location.pathname === "/notifications"}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box sx={{ width: 380, maxHeight: 480 }}>
                  <NotificationList setCount={setUnreadCount} />
                  <Box textAlign="center" p={1}>
                    <Button
                      size="small"
                      onClick={() => {
                        setNotifAnchor(null);
                        navigate("/notifications");
                      }}
                    >
                      Ver todas
                    </Button>
                  </Box>
                </Box>
              </Popover>

              <Typography variant="body2" sx={{ mx: 1.5, display: { xs: "none", sm: "block" } }}>
                {displayName}
              </Typography>
              <IconButton color="inherit" onClick={(e) => setUserAnchor(e.currentTarget)}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                  {(displayName[0] || "U").toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
                <MenuItem
                  onClick={() => {
                    setUserAnchor(null);
                    navigate("/");
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Panel
                </MenuItem>
                {hasMultipleRoles && (
                  <MenuItem
                    onClick={() => {
                      setUserAnchor(null);
                      setOpenChangeRol(true);
                    }}
                  >
                    <ListItemIcon>
                      <SwapHorizIcon fontSize="small" />
                    </ListItemIcon>
                    Cambiar rol
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setUserAnchor(null);
                    logout();
                    navigate("/home");
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Cerrar sesión
                </MenuItem>
              </Menu>

              <SimpleDialog
                open={openChangeRol}
                onClose={() => setOpenChangeRol(false)}
                tittle="Cambiar de rol"
                maxWidth="xs"
                fullWidth
              >
                <CambiarRol onClose={() => setOpenChangeRol(false)} />
              </SimpleDialog>
            </>
          )}
        </Toolbar>
      </AppBar>

      {showDrawer && (
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? DRAWER_W : theme.spacing(7),
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerOpen ? DRAWER_W : theme.spacing(7),
              boxSizing: "border-box",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, pt: 10, px: { xs: 2, md: 3 }, pb: 3, width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
