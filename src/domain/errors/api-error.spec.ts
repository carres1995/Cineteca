// src/domain/errors/api-error.spec.ts
import { describe, expect, it } from 'vitest';
import type { ApiErrorDetail } from './api-error';
import { ApiError, isApiError, isRetryable } from './api-error';

describe('ApiError', () => {
  it('lleva el detalle consigo y se reconoce', () => {
    const error = new ApiError({ kind: 'notFound' });

    expect(isApiError(error)).toBe(true);
    expect(error.detail).toEqual({ kind: 'notFound' });
    expect(error.name).toBe('ApiError');
  });

  it('cualquier otra cosa no es un ApiError', () => {
    expect(isApiError(new Error('cualquiera'))).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});

describe('isRetryable: reintentar lo que puede cambiar, y nada más', () => {
  const retryable: ApiErrorDetail[] = [
    { kind: 'network' },
    { kind: 'timeout' },
    { kind: 'server', status: 503 },
    { kind: 'rateLimited', retryAfterMs: 1000 },
  ];

  const pointless: ApiErrorDetail[] = [
    { kind: 'canceled' },
    { kind: 'unauthorized' },
    { kind: 'notFound' },
    { kind: 'invalidRequest', detail: 'página inválida' },
    { kind: 'invalidResponse', detail: 'campo roto' },
    { kind: 'storageWrite' },
    { kind: 'unknown' },
  ];

  it.each(retryable)('reintenta $kind', (detail) => {
    expect(isRetryable(detail)).toBe(true);
  });

  it.each(pointless)('no reintenta $kind: la respuesta sería la misma', (detail) => {
    expect(isRetryable(detail)).toBe(false);
  });
});
