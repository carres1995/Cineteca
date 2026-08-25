import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages sirve el proyecto bajo /Cineteca/, no en la raíz del dominio.
  base: '/Cineteca/',
  plugins: [react(), tailwindcss()],
  // Vite 8 resuelve nativamente los `paths` de tsconfig (@/* → src/*).
  resolve: { tsconfigPaths: true },
});
