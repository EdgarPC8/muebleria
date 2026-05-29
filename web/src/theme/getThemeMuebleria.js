/**
 * Tema MUI Comercial Calva Cueva (azul/amarillo, claro y oscuro).
 */
import { createTheme, alpha } from "@mui/material/styles";

/** Paleta por modo */
const calvaPalette = {
  light: {
    primary: { light: "#42A5F5", main: "#1565C0", dark: "#0D47A1", contrastText: "#fff" },
    secondary: { light: "#FFE082", main: "#FFC107", dark: "#FF8F00", contrastText: "#1a1a1a" },
  },
  dark: {
    primary: { light: "#64B5F6", main: "#1976D2", dark: "#0D47A1", contrastText: "#fff" },
    secondary: { light: "#FFD54F", main: "#FFC107", dark: "#FFA000", contrastText: "#111" },
  },
  neon: {
    primary: { light: "#40C4FF", main: "#00B0FF", dark: "#0091EA", contrastText: "#000" },
    secondary: { light: "#FFFF8D", main: "#FFEA00", dark: "#FFC400", contrastText: "#000" },
  },
};

function componentVariants() {
  return {
    MuiPaper: {
      variants: [
        {
          props: { variant: "panel" },
          style: ({ theme }) => {
            const isNeon = theme.palette.customMode === "neon";
            return {
              borderRadius: 16,
              border: isNeon
                ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}`
                : `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              boxShadow: isNeon
                ? `0 0 24px ${alpha(theme.palette.secondary.main, 0.2)}`
                : "0 8px 32px rgba(13,71,161,0.08)",
              backdropFilter: theme.palette.mode === "light" ? "blur(8px)" : "none",
            };
          },
        },
      ],
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", borderRadius: 12, fontWeight: 600 } },
      variants: [
        {
          props: { variant: "ctrl" },
          style: ({ theme }) => ({
            borderRadius: 14,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: theme.palette.mode === "light" ? "#fff" : theme.palette.background.default,
            "&:hover": { filter: "brightness(1.08)" },
          }),
        },
      ],
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background:
            theme.palette.customMode === "neon"
              ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.35)})`
              : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        }),
      },
    },
  };
}

export function getThemeMuebleria(mode = "light") {
  if (mode === "dark") {
    const p = calvaPalette.dark;
    return createTheme({
      palette: {
        mode: "dark",
        customMode: "dark",
        background: { default: "#0A1628", paper: "#0F2137" },
        primary: p.primary,
        secondary: p.secondary,
        text: { primary: "#E3F2FD", secondary: alpha("#E3F2FD", 0.75) },
        divider: alpha(p.primary.main, 0.2),
      },
      shape: { borderRadius: 14 },
      typography: { fontFamily: `'Inter', system-ui, sans-serif` },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              background: `radial-gradient(900px 500px at 0% 0%, ${alpha(p.primary.main, 0.15)}, transparent 55%),
                radial-gradient(700px 400px at 100% 0%, ${alpha(p.secondary.main, 0.08)}, transparent 50%),
                #0A1628`,
            },
          },
        },
        ...componentVariants(),
      },
    });
  }

  if (mode === "neon") {
    const p = calvaPalette.neon;
    return createTheme({
      palette: {
        mode: "dark",
        customMode: "neon",
        background: { default: "#050810", paper: "#0A1020" },
        primary: p.primary,
        secondary: p.secondary,
        text: { primary: "#E8F4FF", secondary: alpha("#E8F4FF", 0.85) },
        divider: alpha(p.secondary.main, 0.3),
      },
      shape: { borderRadius: 18 },
      typography: { fontFamily: `'Inter', system-ui, sans-serif` },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              background: `radial-gradient(1000px 500px at 15% -5%, ${alpha(p.primary.main, 0.25)}, transparent 55%),
                radial-gradient(800px 400px at 95% 5%, ${alpha(p.secondary.main, 0.18)}, transparent 50%),
                #050810`,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              border: `1px solid ${alpha(p.primary.main, 0.35)}`,
              boxShadow: `0 0 28px ${alpha(p.secondary.main, 0.12)}`,
            },
          },
        },
        ...componentVariants(),
      },
    });
  }

  const p = calvaPalette.light;
  return createTheme({
    palette: {
      mode: "light",
      customMode: "light",
      background: { default: "#F4F8FC", paper: "rgba(255,255,255,0.94)" },
      primary: p.primary,
      secondary: p.secondary,
      text: { primary: "#0D2137", secondary: "#455A64" },
      divider: alpha(p.primary.main, 0.15),
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: `'Inter', system-ui, sans-serif` },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: `radial-gradient(900px 450px at 10% -5%, ${alpha(p.primary.light, 0.2)}, transparent 55%),
              radial-gradient(700px 350px at 100% 0%, ${alpha(p.secondary.light, 0.35)}, transparent 50%),
              linear-gradient(180deg, #F8FBFF 0%, #E3EEF9 100%)`,
            backgroundAttachment: "fixed",
          },
        },
      },
      ...componentVariants(),
    },
  });
}
