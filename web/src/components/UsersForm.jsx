import { useState, useEffect } from "react";
import { Grid, TextField, Button } from "@mui/material";

export default function UsersForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({
    email: "",
    username: "",
    firstName: "",
    firstLastName: "",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        email: initialData.email || "",
        username: initialData.username || "",
        firstName: initialData.firstName || "",
        firstLastName: initialData.firstLastName || "",
        password: initialData.password || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Nombre de usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Primer nombre"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Primer apellido"
              name="firstLastName"
              value={form.firstLastName}
              onChange={handleChange}
              required
            />
          </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            {initialData ? "Actualizar" : "Registrar"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
