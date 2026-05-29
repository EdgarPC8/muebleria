/**
 * Administración de personas (users). Solo Administrador y Programador.
 */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import UserForm from "../components/Forms/UserForm.jsx";
import { deleteUserRequest, getUsersRequest } from "../api/userRequest.js";
import { useAuth } from "../context/AuthContext.jsx";

const ALLOWED = new Set(["Programador", "Administrador"]);

const fullName = (r) =>
  [r.firstName, r.secondName, r.firstLastName, r.secondLastName].filter(Boolean).join(" ") || "—";

const genderLabel = (g) => (g === "M" ? "Masculino" : g === "F" ? "Femenino" : g || "—");

export default function UsuariosPage() {
  const { user, toast } = useAuth();
  const [rows, setRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    const { data } = await getUsersRequest();
    setRows(data || []);
  };

  useEffect(() => {
    if (ALLOWED.has(user?.loginRol)) load();
  }, [user?.loginRol]);

  if (!ALLOWED.has(user?.loginRol)) {
    return <Navigate to="/" replace />;
  }

  const confirmDelete = async () => {
    if (!toDelete?.id) return;
    try {
      await toast({ promise: deleteUserRequest(toDelete.id) });
      setDeleteOpen(false);
      setToDelete(null);
      await load();
    } catch {
      /* toast */
    }
  };

  const columns = [
    { id: "id", label: "Id", getSortValue: (r) => r.id },
    { id: "ci", label: "Cédula" },
    {
      id: "nombre",
      label: "Nombre completo",
      getSearchValue: fullName,
      render: (row) => fullName(row),
    },
    { id: "birthday", label: "Nacimiento" },
    { id: "gender", label: "Género", render: (row) => genderLabel(row.gender) },
    {
      id: "actions",
      label: "Acciones",
      render: (row) => (
        <>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => {
                setToDelete(row);
                setDeleteOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        sx={{ mb: 2 }}
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      >
        Añadir usuario
      </Button>

      <TablePro
        title="Usuarios (personas)"
        rows={rows}
        columns={columns}
        showSearch
        showPagination
        showIndex
        defaultRowsPerPage={10}
        tableMaxHeight={480}
      />

      <SimpleDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        tittle={editing ? "Editar usuario" : "Nuevo usuario"}
        maxWidth="md"
        fullWidth
      >
        <UserForm
          isEditing={Boolean(editing)}
          datos={editing}
          onClose={() => setFormOpen(false)}
          reload={load}
        />
      </SimpleDialog>

      <SimpleDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        tittle="Eliminar usuario"
        message="¿Eliminar esta persona del sistema? Las cuentas asociadas pueden verse afectadas."
        onClickAccept={confirmDelete}
      />
    </Box>
  );
}
