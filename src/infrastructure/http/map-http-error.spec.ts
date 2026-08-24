// src/infrastructure/http/map-http-error.spec.ts
import { AxiosError, AxiosHeaders, CanceledError } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/domain/errors/api-error';
import { DEFAULT_RETRY_AFTER_MS, toApiError } from './map-http-error';

function axiosErrorWith(status: number, data: unknown = {}, headers: Record<string, string> = {}) {
  const error = new AxiosError('fallo');
  error.response = {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(headers),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('la traducción del error crudo, en el borde', () => {
  it('un ApiError ya traducido pasa tal cual', () => {
    const original = new ApiError({ kind: 'notFound' });

    expect(toApiError(original)).toBe(original);
  });

  it('sin respuesta es un fallo de red', () => {
    expect(toApiError(new AxiosError('sin red')).detail).toEqual({ kind: 'network' });
  });

  it('el tiempo agotado tiene su propio nombre', () => {
    const error = new AxiosError('tarde', 'ECONNABORTED');

    expect(toApiError(error).detail).toEqual({ kind: 'timeout' });
  });

  it('una cancelación no es un error que mostrar', () => {
    expect(toApiError(new CanceledError('cancelado')).detail).toEqual({ kind: 'canceled' });
  });

  it('el código 22 de TMDB es una consulta inválida, no un 400 pelado', () => {
    const error = axiosErrorWith(400, { status_code: 22, status_message: 'Invalid page' });

    expect(toApiError(error).detail).toEqual({ kind: 'invalidRequest', detail: 'Invalid page' });
  });

  it('un 400 sin cuerpo útil igual se explica', () => {
    expect(toApiError(axiosErrorWith(400)).detail).toEqual({
      kind: 'invalidRequest',
      detail: 'HTTP 400',
    });
  });

  it('un 5xx es problema del servidor y se puede reintentar', () => {
    expect(toApiError(axiosErrorWith(503)).detail).toEqual({ kind: 'server', status: 503 });
  });

  it('un 429 sin cabecera usa una espera razonable', () => {
    expect(toApiError(axiosErrorWith(429)).detail).toEqual({
      kind: 'rateLimited',
      retryAfterMs: DEFAULT_RETRY_AFTER_MS,
    });
  });

  it('un 429 con Retry-After respeta lo que dijo el servidor', () => {
    const error = axiosErrorWith(429, {}, { 'retry-after': '5' });

    expect(toApiError(error).detail).toEqual({ kind: 'rateLimited', retryAfterMs: 5_000 });
  });

  it('un 403 también es credencial: no se reintenta', () => {
    expect(toApiError(axiosErrorWith(403)).detail).toEqual({ kind: 'unauthorized' });
  });

  it('algo que no es de la librería HTTP no se disfraza de nada', () => {
    expect(toApiError(new Error('vaya usted a saber')).detail).toEqual({ kind: 'unknown' });
  });
});
