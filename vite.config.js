import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["68a7-2406-7400-3d-d5a2-a80d-dec3-c6c1-f867.ngrok-free.app"],
  },
});
