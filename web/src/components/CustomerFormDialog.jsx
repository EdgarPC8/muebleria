import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import CustomerFormFields from "./CustomerFormFields.jsx";
import { createCustomer } from "../api/muebleriaRequest.js";
import {
  EMPTY_CUSTOMER_FORM,
  formToCustomerPayload,
  validateCustomerForm,
} from "../utils/customerUtils.js";

export default function CustomerFormDialog({ open, onClose, onCreated, toast }) {
  const [form, setForm] = useState(EMPTY_CUSTOMER_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(EMPTY_CUSTOMER_FORM);
  }, [open]);

  const handleSave = async () => {
    const err = validateCustomerForm(form);
    if (err) {
      void toast?.({ message: err, variant: "warning" });
      return;
    }
    try {
      setSaving(true);
      const { data } = await createCustomer(formToCustomerPayload(form));
      void toast?.({ message: "Cliente creado.", variant: "success" });
      onCreated?.(data);
      onClose?.();
    } catch (e) {
      void toast?.({
        message: e?.response?.data?.message || "No se pudo guardar el cliente.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Nuevo cliente</DialogTitle>
      <DialogContent dividers>
        <CustomerFormFields form={form} setForm={setForm} />
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
