import react from "@vitejs/plugin-react";
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setupTests",
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
