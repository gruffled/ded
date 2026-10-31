import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:8081",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: false,
    screenshotOnRunFailure: true,
    video: false,
  },
});
