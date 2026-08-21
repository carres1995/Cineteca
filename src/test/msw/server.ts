// src/test/msw/server.ts
import { setupServer } from 'msw/node';

// Arranca sin simulaciones a propósito: cada una se añade con la funcionalidad
// que la necesita, con respuestas reales de la API como base.
export const server = setupServer();
