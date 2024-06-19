import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd());

  // Access the environment variable
  console.log(env.VITE_PORT)
  const port = parseInt(env.VITE_PORT || '3000', 10);

  return {
    plugins: [react()],
    build: {
      outDir: 'build',
      sourcemap: true // Enable source maps
    },
    server: {
      port: port,
      open: true
    }
  };
});
