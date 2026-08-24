// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Sin tests todavía (andamio vacío). Falla recién cuando haya specs
    // presentes y alguno esté roto, no por la mera ausencia de tests.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.smoke.ts',
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/test/**',
      ],
      // El dominio es puro y barato de cubrir: si un archivo suyo es difícil
      // de probar, el problema es el diseño, no el test.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        'src/domain/**/*.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  },
});
