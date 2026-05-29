import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/muebleria/",
  server: {
    host: true,
    port: 5174,
    strictPort: false,
    proxy: {
      "/muebleriaapi": {
        target: "http://localhost:3007",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
