import { Grid, Paper, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const cards = [
  { title: "Productos", desc: "Catálogo, stock y precios", to: "/productos", icon: <InventoryIcon sx={{ fontSize: 40 }} /> },
  { title: "Categorías", desc: "Organiza por tipo de mueble", to: "/categorias", icon: <CategoryIcon sx={{ fontSize: 40 }} /> },
  { title: "Clientes", desc: "Base de clientes", to: "/clientes", icon: <PeopleIcon sx={{ fontSize: 40 }} /> },
  { title: "Proveedores", desc: "Quién te surte", to: "/proveedores", icon: <LocalShippingIcon sx={{ fontSize: 40 }} /> },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom color="primary">
        Panel Calva Cueva
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Gestión de muebles, inventario y contactos.
      </Typography>
      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.to}>
            <Paper variant="panel" sx={{ p: 2.5, height: "100%", cursor: "pointer" }} onClick={() => navigate(c.to)}>
              <Box sx={{ color: "secondary.main", mb: 1 }}>{c.icon}</Box>
              <Typography variant="h6" fontWeight={700}>
                {c.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {c.desc}
              </Typography>
              <Button size="small" variant="ctrl">
                Abrir
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
