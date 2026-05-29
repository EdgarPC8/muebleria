import { useEffect, useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import CustomerFormFields from "../components/CustomerFormFields.jsx";
import { createCustomer, getCustomers, updateCustomer } from "../api/muebleriaRequest.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  EMPTY_CUSTOMER_FORM,
  buildCustomerDisplayName,
  customerToForm,
  formToCustomerPayload,
  formatCustomerDocument,
  validateCustomerForm,
} from "../utils/customerUtils.js";

export default function ClientesPage() {
  const { toast } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(EMPTY_CUSTOMER_FORM);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const res = await getCustomers();
    setCustomers(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    const err = validateCustomerForm(form);
    if (err) {
      toast({ message: err, variant: "warning" });
      return;
    }
    try {
      const payload = formToCustomerPayload(form);
      if (editing?.id) {
        await updateCustomer(editing.id, payload);
        toast({ message: "Cliente actualizado.", variant: "success" });
      } else {
        await createCustomer(payload);
        toast({ message: "Cliente creado.", variant: "success" });
      }
      setForm(EMPTY_CUSTOMER_FORM);
      setEditing(null);
      setOpenDialog(false);
      await load();
    } catch (e) {
      toast({ message: e?.response?.data?.message || "Error al guardar.", variant: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Clientes
      </Typography>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_CUSTOMER_FORM);
            setOpenDialog(true);
          }}
        >
          Nuevo cliente
        </Button>
      </Paper>
      <TablePro
        title="Listado"
        rows={customers}
        columns={[
          { id: "id", label: "ID" },
          { id: "name", label: "Cliente", render: (r) => buildCustomerDisplayName(r) },
          { id: "doc", label: "Documento", render: (r) => formatCustomerDocument(r) || "—" },
          { id: "phone", label: "Teléfono", render: (r) => r.phone || "—" },
          { id: "city", label: "Ciudad", render: (r) => r.city || "—" },
          {
            id: "acc",
            label: "",
            render: (r) => (
              <Button
                size="small"
                onClick={() => {
                  setEditing(r);
                  setForm(customerToForm(r));
                  setOpenDialog(true);
                }}
              >
                Editar
              </Button>
            ),
          },
        ]}
        showSearch
        showPagination
        showIndex
        tableMaxHeight={440}
      />
      <SimpleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        tittle={editing ? "Editar cliente" : "Nuevo cliente"}
        fullWidth
        maxWidth="md"
      >
        <CustomerFormFields form={form} setForm={setForm} />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={onSave}>
          Guardar
        </Button>
      </SimpleDialog>
    </Box>
  );
}
