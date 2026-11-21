import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite config: React plugin, SockJS global polyfill, and proxy to Spring Boot.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
