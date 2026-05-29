import { Button, Paper } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import CustomerFormFields from "../components/CustomerFormFields";
import SimpleDialog from "../components/Dialogs/SimpleDialog";
import UsersForm from "../components/UsersForm";
import TablePro from "../components/Tables/TablePro";
import { useUsers } from "../hooks/useUsers";
import { addUser } from "../api/userRequest";
import { useSnackbar } from "notistack";

export default function UsuariosPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { users, isLoading, fetchUsers } = useUsers();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(null);

  const onSubmit = async (data) => {
    try {
      const res = await addUser(data);
      if (res.data.success) {
        enqueueSnackbar("Usuario Agregado exitosamente", {
          variant: "success",
        });
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.data.message, { variant: "error" });
    }
  };

  return (
    <Box>
      <Paper variant="panel" sx={{ p: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </Paper>
      <SimpleDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        tittle={isEditing ? "Editar usuario" : "Nuevo usuario"}
        fullWidth
        maxWidth="md"
      >
        <UsersForm onSubmit={onSubmit} initialData={form} />
      </SimpleDialog>

      <TablePro
        title="Listado"
        rows={users}
        columns={[
          { id: "id", label: "ID" },
          {
            id: "name",
            label: "Cliente",
            render: (r) => <p>{r.ci}</p>,
          },

          { id: "phone", label: "Teléfono", render: (r) => r.phone || "—" },
          {
            id: "acc",
            label: "",
            render: (r) => (
              <Button
                size="small"
                onClick={() => {
                  setIsOpen(true);
                  setIsEditing(true);
                  setForm({
                    email: r.email,
                    username: r.username,
                    firstName: r.firstName,
                    firstLastName: r.firstLastName,
                    password: "",
                  });
                }}
              >
                Editar
              </Button>
            ),
          },
        ]}
      />
    </Box>
  );
}
