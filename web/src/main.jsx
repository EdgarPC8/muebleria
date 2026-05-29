/**
 * Punto de entrada React: router con base /muebleria, tema y notistack.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ThemeModeProvider } from "./theme/ThemeModeProvider.jsx";
import App from "./App.jsx";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <BrowserRouter basename="/muebleria">
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeModeProvider>
  </React.StrictMode>
);
