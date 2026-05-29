import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useAuth } from "../context/AuthContext.jsx";

const SCANNER_ELEMENT_ID = "muebleria-barcode-scanner-region";

const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
];

export default function BarcodeScanDialog({ open, onClose, onDecoded }) {
  const { toast } = useAuth();
  const scannerRef = useRef(null);
  const refocusTimerRef = useRef(null);
  const onDecodedRef = useRef(onDecoded);
  const onCloseRef = useRef(onClose);
  onDecodedRef.current = onDecoded;
  onCloseRef.current = onClose;

  const [smallCodeMode, setSmallCodeMode] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const applyTrackConstraints = useCallback(async (next) => {
    const s = scannerRef.current;
    if (!s?.applyVideoConstraints) return;
    try {
      await s.applyVideoConstraints(next);
    } catch {
      /* dispositivo sin soporte */
    }
  }, []);

  const triggerRefocus = useCallback(async () => {
    const s = scannerRef.current;
    if (!s?.applyVideoConstraints) return;
    try {
      await s.applyVideoConstraints({ advanced: [{ focusMode: "single-shot" }] });
      await s.applyVideoConstraints({ advanced: [{ focusMode: "continuous" }] });
    } catch {
      /* ignore */
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (refocusTimerRef.current) {
      clearInterval(refocusTimerRef.current);
      refocusTimerRef.current = null;
    }
    const s = scannerRef.current;
    scannerRef.current = null;
    if (!s) return;
    try {
      await s.stop();
    } catch {
      /* ya detenido */
    }
    try {
      s.clear();
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    if (!open) {
      void stopScanner();
      setTorchOn(false);
      setTorchSupported(false);
      return undefined;
    }

    let cancelled = false;

    const start = async () => {
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;
      try {
        const html5 = new Html5Qrcode(SCANNER_ELEMENT_ID, {
          formatsToSupport: FORMATS,
          verbose: false,
        });
        scannerRef.current = html5;
        const qrboxWidth = smallCodeMode ? 240 : 320;
        const qrboxHeight = smallCodeMode ? 120 : 180;
        await html5.start(
          { facingMode: { ideal: "environment" } },
          {
            fps: smallCodeMode ? 12 : 8,
            qrbox: { width: qrboxWidth, height: qrboxHeight },
            aspectRatio: 1.777,
            disableFlip: true,
            videoConstraints: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              advanced: [{ focusMode: "continuous" }],
            },
          },
          (decodedText) => {
            if (cancelled || !decodedText) return;
            const value = String(decodedText).trim();
            void stopScanner().finally(() => {
              if (!cancelled && value) onDecodedRef.current(value);
              if (!cancelled) onCloseRef.current();
            });
          },
          () => {}
        );

        const caps = html5.getRunningTrackCapabilities?.() || {};
        const torchIsSupported =
          !!caps.torch ||
          (Array.isArray(caps.fillLightMode) && caps.fillLightMode.includes("flash"));
        setTorchSupported(torchIsSupported);

        await applyTrackConstraints({ advanced: [{ focusMode: "continuous" }] });
        await triggerRefocus();
        refocusTimerRef.current = setInterval(() => {
          void triggerRefocus();
        }, 1000);
      } catch (e) {
        if (!cancelled) {
          void toast?.({
            message:
              e?.message ||
              "No se pudo usar la cámara. Revisa permisos y que el sitio use HTTPS (o localhost).",
            variant: "error",
          });
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stopScanner, smallCodeMode, applyTrackConstraints, triggerRefocus]);

  const handleCancel = () => {
    void stopScanner().finally(() => onClose());
  };

  const toggleTorch = async () => {
    const next = !torchOn;
    setTorchOn(next);
    await applyTrackConstraints({ advanced: [{ torch: next }] });
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Escanear código de barras</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Apunta la cámara al código del producto. Al leerlo bien, se cerrará solo y se agregará al carrito.
        </Typography>
        <FormControlLabel
          sx={{ mb: 1 }}
          control={
            <Checkbox
              size="small"
              checked={smallCodeMode}
              onChange={(e) => setSmallCodeMode(e.target.checked)}
            />
          }
          label="Modo código pequeño (mejor lectura de códigos chicos)"
        />
        {torchSupported ? (
          <Button size="small" variant={torchOn ? "contained" : "outlined"} sx={{ mb: 1 }} onClick={toggleTorch}>
            {torchOn ? "Apagar luz" : "Encender luz"}
          </Button>
        ) : null}
        <Box
          id={SCANNER_ELEMENT_ID}
          onClick={() => {
            void triggerRefocus();
          }}
          sx={{
            width: "100%",
            minHeight: 220,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "grey.900",
            cursor: "crosshair",
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
