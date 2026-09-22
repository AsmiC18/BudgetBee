import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is just a fast dev server + build tool for React.
// This config is intentionally minimal - the defaults do most of the work.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
