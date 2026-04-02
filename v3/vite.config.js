import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_BASE = "https://goodtelly-production.up.railway.app";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API_BASE,
        changeOrigin: true,
      },
      "/share": {
        target: API_BASE,
        changeOrigin: true,
      },
    },
  },
});
