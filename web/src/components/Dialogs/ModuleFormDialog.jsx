import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const EMPTY_MODULE = { name: "", description: "", key: "" };

function normalizeSections(module) {
  if (!module) return [];
  if (module.sections) return module.sections.map((s) => (typeof s === "string" ? s : s.name));
  if (module.routes) return [...module.routes];
  return [];
}

export default function ModuleFormDialog({ open, onClose, onSave, module: editModule, toast }) {
  const isEditing = !!editModule;
  const [form, setForm] = useState(EMPTY_MODULE);
  const [sections, setSections] = useState([]);
  const [sectionInput, setSectionInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (open) {
      if (editModule) {
        setForm({
          name: editModule.name || "",
          description: editModule.description || "",
          key: editModule.key || "",
        });
        setSections(normalizeSections(editModule));
      } else {
        setForm(EMPTY_MODULE);
        setSections([]);
      }
      setSectionInput("");
      setEditingIndex(null);
      setEditValue("");
    }
  }, [open, editModule]);

  const handleAddSection = () => {
    const val = sectionInput.trim();
    if (!val) return;
    if (sections.includes(val)) {
      toast?.({ message: "La sección ya existe.", variant: "warning" });
      return;
    }
    setSections((prev) => [...prev, val]);
    setSectionInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSection();
    }
  };

  const handleDeleteSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditValue(sections[index]);
  };

  const handleConfirmEdit = () => {
    const val = editValue.trim();
    if (!val) return;
    setSections((prev) => prev.map((s, i) => (i === editingIndex ? val : s)));
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast?.({ message: "El nombre del módulo es obligatorio.", variant: "warning" });
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      sections: sections.map((s) => ({ name: s })),
    };
    onSave?.(payload);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? "Editar módulo" : "Nuevo módulo"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre del módulo"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Key"
            value={form.key}
            onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
            fullWidth
            size="small"
            helperText="Identificador único del módulo"
          />
          <TextField
            label="Agregar sección"
            value={sectionInput}
            onChange={(e) => setSectionInput(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
            placeholder="Escribe y presiona Enter"
            InputProps={{
              endAdornment: sectionInput.trim() ? (
                <InputAdornment position="end">
                  <Button size="small" onClick={handleAddSection} sx={{ minWidth: "auto" }}>
                    Enter
                  </Button>
                </InputAdornment>
              ) : null,
            }}
          />
          {sections.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {sections.map((s, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {editingIndex === i ? (
                      <TextField
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                        sx={{ "& .MuiInputBase-root": { height: 32 } }}
                      />
                    ) : (
                      <Chip label={s} size="small" />
                    )}
                    {editingIndex === i ? (
                      <>
                        <IconButton size="small" color="primary" onClick={handleConfirmEdit}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancelEdit}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton size="small" onClick={() => handleStartEdit(i)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteSection(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          {isEditing ? "Guardar cambios" : "Crear módulo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
