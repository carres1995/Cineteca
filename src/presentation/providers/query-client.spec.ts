// src/presentation/providers/query-client.spec.ts
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/domain/errors/api-error';
import { createQueryClient } from './query-client';

/** La política de reintentos se lee del cliente y se prueba como lo que es: una decisión. */
function policy() {
  const options = createQueryClient().getDefaultOptions().queries;
  const retry = options?.retry;
  const retryDelay = options?.retryDelay;

  if (typeof retry !== 'function' || typeof retryDelay !== 'function') {
    throw new Error('El cliente tiene que decidir sus reintentos');
  }

  return { retry, retryDelay };
}

describe('la política de reintentos de la caché', () => {
  it('no reintenta un 404 ni una credencial inválida: la respuesta sería la misma', () => {
    const { retry } = policy();

    expect(retry(0, new ApiError({ kind: 'notFound' }))).toBe(false);
    expect(retry(0, new ApiError({ kind: 'unauthorized' }))).toBe(false);
  });

  it('reintenta un fallo de red, pero no para siempre', () => {
    const { retry } = policy();

    expect(retry(0, new ApiError({ kind: 'network' }))).toBe(true);
    expect(retry(1, new ApiError({ kind: 'network' }))).toBe(true);
    expect(retry(2, new ApiError({ kind: 'network' }))).toBe(false);
  });

  it('un límite de tasa se respeta UNA vez: dos es un bucle', () => {
    const { retry, retryDelay } = policy();
    const rateLimited = new ApiError({ kind: 'rateLimited', retryAfterMs: 3_000 });

    expect(retry(0, rateLimited)).toBe(true);
    expect(retry(1, rateLimited)).toBe(false);
    // Y se espera lo que dijo el servidor, no lo que a nosotros nos parezca.
    expect(retryDelay(0, rateLimited)).toBe(3_000);
  });

  it('el resto de reintentos crece pero tiene techo', () => {
    const { retryDelay } = policy();
    const network = new ApiError({ kind: 'network' });

    expect(retryDelay(0, network)).toBe(1_000);
    expect(retryDelay(1, network)).toBe(2_000);
    expect(retryDelay(99, network)).toBe(30_000);
  });

  it('un error que no es nuestro no se reintenta a ciegas', () => {
    const { retry, retryDelay } = policy();

    expect(retry(0, new Error('cualquiera'))).toBe(false);
    expect(retryDelay(0, new Error('cualquiera'))).toBe(1_000);
  });
});
