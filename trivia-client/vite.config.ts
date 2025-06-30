import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
    host: true,
    cors: true,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  define: {
    // Ayuda a manejar diferencias entre servidor y cliente
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  // Configuración para desarrollo
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
