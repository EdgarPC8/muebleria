/**
 * Control de archivos del servidor (/files). Solo Programador.
 */
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TablePro from "../components/Tables/TablePro.jsx";
import SimpleDialog from "../components/Dialogs/SimpleDialog.jsx";
import UploadFileForm from "../components/Forms/UploadFileForm.jsx";
import {
  deleteFileRequest,
  downloadFilesFolderZipRequest,
  downloadOneFileRequest,
  saveBlobAsFile,
  scanFilesRequest,
} from "../api/fileRequest.js";
import { pathFiles } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ArchivosPage() {
  const { user, toast } = useAuth();
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [folder, setFolder] = useState("");
  const [maxDepth, setMaxDepth] = useState(5);
  const [openUpload, setOpenUpload] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const fetchScan = async () => {
    const { data } = await scanFilesRequest({ folder, maxDepth });
    setRows(data?.files || []);
    setTotals(data?.totals || null);
  };

  useEffect(() => {
    if (user?.loginRol === "Programador") fetchScan().catch(() => {});
  }, [user?.loginRol]);

  if (user?.loginRol !== "Programador") return <Navigate to="/" replace />;

  const confirmDelete = async () => {
    if (!rowToDelete?.relPath) return;
    try {
      await toast({ promise: deleteFileRequest(rowToDelete.relPath) });
      setOpenDelete(false);
      await fetchScan();
    } catch {
      /* toast */
    }
  };

  const downloadZip = async () => {
    try {
      const { data } = await downloadFilesFolderZipRequest(folder);
      saveBlobAsFile(new Blob([data]), `${(folder || "files").replace(/[/\\]/g, "_")}.zip`);
    } catch (error) {
      toast({ message: error?.response?.data?.message || "Error al descargar", variant: "error" });
    }
  };

  const downloadOne = async (row) => {
    try {
      const { data } = await downloadOneFileRequest(row.relPath);
      saveBlobAsFile(data, row.name);
    } catch (error) {
      toast({ message: error?.response?.data?.message || "Error al descargar", variant: "error" });
    }
  };

  const columns = useMemo(
    () => [
      { id: "relPath", label: "Ruta", getSearchValue: (r) => r.relPath },
      { id: "name", label: "Nombre" },
      { id: "ext", label: "Ext" },
      { id: "sizeHuman", label: "Tamaño" },
      {
        id: "actions",
        label: "Acciones",
        render: (row) => (
          <>
            <Tooltip title="Descargar">
              <IconButton size="small" onClick={() => downloadOne(row)}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={() => {
                  setRowToDelete(row);
                  setOpenDelete(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    []
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Control de archivos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Base: <strong>{pathFiles}</strong>
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }} alignItems="center">
        <TextField size="small" label="Carpeta" value={folder} onChange={(e) => setFolder(e.target.value)} fullWidth />
        <TextField
          size="small"
          label="Profundidad"
          type="number"
          value={maxDepth}
          onChange={(e) => setMaxDepth(Number(e.target.value || 5))}
          sx={{ width: 120 }}
        />
        <IconButton onClick={() => fetchScan()}>
          <RefreshIcon />
        </IconButton>
        <Button startIcon={<UploadFileIcon />} onClick={() => setOpenUpload(true)}>
          Subir
        </Button>
        <Button startIcon={<DownloadIcon />} onClick={downloadZip}>
          ZIP
        </Button>
      </Stack>

      <Chip size="small" label={`Archivos: ${totals?.totalFiles ?? 0}`} sx={{ mb: 2 }} />

      <TablePro title="Archivos" rows={rows} columns={columns} showSearch showPagination defaultRowsPerPage={10} />

      <SimpleDialog open={openUpload} onClose={() => setOpenUpload(false)} tittle="Subir archivo" maxWidth="sm" fullWidth>
        <UploadFileForm
          defaultFolder={folder}
          onClose={() => setOpenUpload(false)}
          onUploaded={() => {
            setOpenUpload(false);
            fetchScan();
          }}
        />
      </SimpleDialog>

      <SimpleDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        tittle="Eliminar archivo"
        message={`¿Eliminar ${rowToDelete?.relPath}?`}
        onClickAccept={confirmDelete}
      />
    </Box>
  );
}
