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
    exclude: ["**\/node_modules/**", "**\/mocks/**", "Coaching.jsx", "**\/functions/**", "useAuth.ts"],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: { 
      exclude: [
        "**\/node_modules/**", 
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '**/[.]**',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        "**\/mocks/**",
        "**\/Coaching.jsx",
        "**\/functions/**",
        "**\/useAuth.ts",
        '**\/interfaceDefinitions.tsx',
        '**/vite-env.d.ts',
        '**/react-app-env.d.ts',
      ],
    }
  }
});
