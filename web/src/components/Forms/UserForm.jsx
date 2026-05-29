/**
 * Formulario crear/editar persona (tabla users).
 */
import { useEffect, useState } from "react";
import { Box, Button, Grid, MenuItem, TextField } from "@mui/material";
import { addUserRequest, getOneUserRequest, updateUserRequest } from "../../api/userRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";

const EMPTY = {
  ci: "",
  firstName: "",
  secondName: "",
  firstLastName: "",
  secondLastName: "",
  gender: "",
  birthday: "",
};

export default function UserForm({ isEditing = false, datos = null, onClose, reload }) {
  const { toast } = useAuth();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!isEditing || !datos?.id) return;
    getOneUserRequest(datos.id)
      .then((res) => {
        const u = res.data || {};
        setForm({
          ci: u.ci || "",
          firstName: u.firstName || "",
          secondName: u.secondName || "",
          firstLastName: u.firstLastName || "",
          secondLastName: u.secondLastName || "",
          gender: u.gender || "",
          birthday: u.birthday ? String(u.birthday).slice(0, 10) : "",
        });
      })
      .catch(() => {});
  }, [isEditing, datos?.id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.ci?.trim() || !form.firstName?.trim() || !form.firstLastName?.trim()) {
      toast({ message: "Cédula, primer nombre y primer apellido son obligatorios.", variant: "warning" });
      return;
    }
    const payload = {
      ...form,
      ci: form.ci.trim(),
      firstName: form.firstName.trim(),
      firstLastName: form.firstLastName.trim(),
      secondName: form.secondName?.trim() || null,
      secondLastName: form.secondLastName?.trim() || null,
      birthday: form.birthday || null,
      gender: form.gender || null,
    };
    try {
      await toast({
        promise: isEditing
          ? updateUserRequest(datos.id, payload)
          : addUserRequest(payload),
      });
      if (reload) await reload();
      if (onClose) onClose();
      if (!isEditing) setForm(EMPTY);
    } catch {
      /* toast */
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Cédula" fullWidth required value={form.ci} onChange={set("ci")} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Primer nombre" fullWidth required value={form.firstName} onChange={set("firstName")} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Segundo nombre" fullWidth value={form.secondName} onChange={set("secondName")} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Primer apellido" fullWidth required value={form.firstLastName} onChange={set("firstLastName")} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Segundo apellido" fullWidth value={form.secondLastName} onChange={set("secondLastName")} />
        </Grid>
        <Grid item xs={6}>
          <TextField select label="Género" fullWidth value={form.gender} onChange={set("gender")}>
            <MenuItem value="">—</MenuItem>
            <MenuItem value="M">Masculino</MenuItem>
            <MenuItem value="F">Femenino</MenuItem>
            <MenuItem value="otro">Otro</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Fecha de nacimiento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.birthday}
            onChange={set("birthday")}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            {isEditing ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
