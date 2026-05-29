/** Campos reutilizables del formulario de cliente. */
import { Grid, TextField, MenuItem } from "@mui/material";
import { DOC_TYPE_OPTIONS } from "../utils/customerUtils.js";

export default function CustomerFormFields({ form, setForm }) {
  return (
    <Grid container spacing={1.5}>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Primer nombre *" value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Segundo nombre" value={form.secondName} onChange={(e) => setForm((s) => ({ ...s, secondName: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Primer apellido *" value={form.firstLastName} onChange={(e) => setForm((s) => ({ ...s, firstLastName: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Segundo apellido" value={form.secondLastName} onChange={(e) => setForm((s) => ({ ...s, secondLastName: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField select fullWidth size="small" label="Documento" value={form.documentType} onChange={(e) => setForm((s) => ({ ...s, documentType: e.target.value }))}>
          {DOC_TYPE_OPTIONS.map((d) => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Número" value={form.documentNumber} onChange={(e) => setForm((s) => ({ ...s, documentNumber: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Teléfono" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Ciudad" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth size="small" label="Dirección" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
      </Grid>
    </Grid>
  );
}
