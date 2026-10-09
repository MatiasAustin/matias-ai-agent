import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { app } from './server/app';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'express-api-middleware',
      configureServer(server) {
        server.middlewares.use(app);
      }
    }
  ],
});
