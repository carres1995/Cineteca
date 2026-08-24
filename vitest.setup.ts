/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './src/test/msw/server';

// El margen por defecto de `findBy` es 1 s, y con toda la suite en paralelo una
// ruta perezosa puede tardar más en una máquina cargada. Esperar más no tapa
// ningún fallo: si algo está roto, igual no aparece nunca.
configure({ asyncUtilTimeout: 5_000 });

// onUnhandledRequest: 'error' es la línea que hace útil a MSW: una petición que
// nadie simuló revienta el test en vez de irse a la red de verdad.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => {
  server.close();
});

// jsdom no implementa ninguno de los dos, y el tema y el virtualizador los piden.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
