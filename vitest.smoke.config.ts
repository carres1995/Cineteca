// vitest.smoke.config.ts
// Prueba de humo CONTRA LA API REAL. No entra en el gate a propósito: depende
// de la red y de una credencial, y un gate que depende de internet no es un
// gate. Se corre a mano con `pnpm smoke`, en modo development para que Vite
// cargue el .env de verdad (el gate usa el .env.test de mentira).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.smoke.ts'],
    testTimeout: 20_000,
  },
});
