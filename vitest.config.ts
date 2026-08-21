// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.{ts,tsx}', 'src/main.tsx', 'src/**/*.d.ts', 'src/test/**'],
      // Los umbrales se activan en el paso del dominio, cuando ya haya código
      // propio que cubrir. Encenderlos con el andamio vacío solo enseña a
      // negociar con el gate.
      // thresholds: {
      //   lines: 80, functions: 80, branches: 80, statements: 80,
      //   'src/domain/**/*.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
      // },
    },
  },
});
