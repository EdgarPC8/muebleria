import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import axios from "../api/axios.js";
import { buildImageUrl } from "../api/axios.js";

export default function MueblesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    axios
      .get("/muebleria/muebles")
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category?.name).filter(Boolean))].sort();

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category?.name === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box textAlign="center" mb={4}>
        <InventoryIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Nuestros productos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
          Explora nuestro catálogo de muebles y artículos para el hogar.
        </Typography>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField
          size="small"
          placeholder="Buscar productos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Categoría"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No se encontraron productos.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  transition: "0.2s",
                  "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
                }}
              >
                <CardMedia
                  component="img"
                  height={200}
                  image={p.primaryImageUrl ? buildImageUrl(p.primaryImageUrl) : "https://placehold.co/400x300?text=Sin+imagen"}
                  alt={p.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap>
                    {p.name}
                  </Typography>
                  {p.sizeLabel && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {p.sizeLabel}
                    </Typography>
                  )}
                  <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                    {p.category && (
                      <Chip label={p.category.name} size="small" color="primary" variant="outlined" />
                    )}
                    {p.brand && (
                      <Chip label={p.brand.name} size="small" variant="outlined" />
                    )}
                  </Box>
                  <Box mt="auto" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      ${Number(p.salePrice).toFixed(2)}
                    </Typography>
                    <Chip
                      label={p.stockBase > 0 ? "Disponible" : "Agotado"}
                      size="small"
                      color={p.stockBase > 0 ? "success" : "error"}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
