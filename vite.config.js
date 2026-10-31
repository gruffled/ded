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
    // Full UI walkthroughs are slow under coverage instrumentation.
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}", "src/test/**", "src/main.jsx"],
      reporter: ["text-summary", "text"],
      // A floor, not a target: fail CI if coverage drops noticeably.
      thresholds: { statements: 95, lines: 95, functions: 85, branches: 85 },
    },
  },
});
