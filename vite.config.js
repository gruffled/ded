import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // Set VITE_BASE_PATH (e.g. /encounters/) when serving from a subpath.
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: {
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
