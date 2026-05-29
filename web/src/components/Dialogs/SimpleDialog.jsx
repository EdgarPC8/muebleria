import {
    Container,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Box,
  } from "@mui/material";
  import IconButton from "@mui/material/IconButton";
  import CloseIcon from "@mui/icons-material/Close";
  
  function SimpleDialog({
    onClickAccept,
    message,
    tittle,
    open,
    onClose,
    children,
    maxWidth = "sm",   // por defecto "sm"
    fullWidth = false, // por defecto false
  }) {
    return (
<Dialog
  open={open}
  onClose={onClose}
  maxWidth={maxWidth}
  fullWidth={fullWidth}
>


          {/* Box para alinear correctamente el título y el botón de cierre */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <DialogTitle id="alert-dialog-title" sx={{ flexGrow: 1 }}>
              {tittle ? tittle : "Titulo"}
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
  
          <DialogContent>
            {/* Si se proporciona el prop children, se mostrará aquí */}
            {children ? (
              children
            ) : (
              <DialogContentText id="alert-dialog-description">
                {message ? message : "Aquí su Mensaje"}
              </DialogContentText>
            )}
          </DialogContent>
  
          {/* Mostrar DialogActions solo si se proporciona onClickAccept */}
          {onClickAccept && (
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button onClick={onClickAccept} autoFocus>
                Aceptar
              </Button>
            </DialogActions>
          )}
        </Dialog>
    );
  }
  
  export default SimpleDialog;
  