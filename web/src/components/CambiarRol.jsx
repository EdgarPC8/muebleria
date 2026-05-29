import { Button, Typography, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";

export default function CambiarRol({ onClose }) {
  const { user, changeRole } = useAuth();
  const currentRolId = user?.rolId;

  if (!user?.roles?.length) {
    return <Typography color="text.secondary">No hay roles disponibles.</Typography>;
  }

  const handleSelectRol = async (rolId) => {
    if (rolId === currentRolId) {
      onClose?.();
      return;
    }
    await changeRole(rolId);
    onClose?.();
  };

  return (
    <Stack spacing={1.5}>
      {user.roles.map((rol) => (
        <Button
          key={rol.id}
          variant={rol.id === currentRolId ? "contained" : "outlined"}
          color={rol.id === currentRolId ? "primary" : "inherit"}
          onClick={() => handleSelectRol(rol.id)}
          sx={{ justifyContent: "flex-start", fontWeight: 600 }}
        >
          {rol.name}
          {rol.id === currentRolId ? " (actual)" : ""}
        </Button>
      ))}
    </Stack>
  );
}
