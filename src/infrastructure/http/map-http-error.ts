// src/infrastructure/http/map-http-error.ts
import axios from 'axios';
import { z } from 'zod';
import { ApiError, type ApiErrorDetail } from '@/domain/errors/api-error';

/**
 * TMDB responde con un código propio que NO coincide con el HTTP: "recurso no
 * encontrado" es su 34 con un 404, y "página inválida" es su 22 con un 400.
 * Esa traducción ocurre aquí, una sola vez.
 */
const TMDB_STATUS = {
  INVALID_API_KEY: 7,
  INVALID_PAGE: 22,
  RESOURCE_NOT_FOUND: 34,
} as const;

/** Cuando el 429 no trae `Retry-After`, esperamos algo razonable. */
export const DEFAULT_RETRY_AFTER_MS = 1_000;

/** El cuerpo de error también es un borde: se valida, no se asume. */
const errorBodySchema = z.object({
  status_code: z.number().optional(),
  status_message: z.string().optional(),
});

const headersSchema = z.object({
  'retry-after': z.union([z.string(), z.number()]).optional(),
});

function retryAfterMsFrom(headers: unknown): number {
  const parsed = headersSchema.safeParse(headers);
  const raw = parsed.success ? parsed.data['retry-after'] : undefined;
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1_000 : DEFAULT_RETRY_AFTER_MS;
}

function detailFromResponse(status: number, headers: unknown, data: unknown): ApiErrorDetail {
  const body = errorBodySchema.safeParse(data);
  const tmdbCode = body.success ? body.data.status_code : undefined;
  const tmdbMessage = body.success ? body.data.status_message : undefined;

  if (status === 429) return { kind: 'rateLimited', retryAfterMs: retryAfterMsFrom(headers) };
  if (status >= 500) return { kind: 'server', status };
  if (tmdbCode === TMDB_STATUS.INVALID_API_KEY || status === 401 || status === 403) {
    return { kind: 'unauthorized' };
  }
  if (tmdbCode === TMDB_STATUS.RESOURCE_NOT_FOUND || status === 404) return { kind: 'notFound' };
  if (tmdbCode === TMDB_STATUS.INVALID_PAGE) {
    return { kind: 'invalidRequest', detail: tmdbMessage ?? 'Página fuera de rango' };
  }
  if (status >= 400)
    return { kind: 'invalidRequest', detail: tmdbMessage ?? `HTTP ${String(status)}` };
  return { kind: 'unknown' };
}

/** Único punto donde un error crudo de la red se convierte en error del dominio. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) return new ApiError({ kind: 'canceled' }, { cause: error });

  // El genérico deja `data` como `unknown`: el cuerpo del error también se valida.
  if (axios.isAxiosError<unknown>(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ kind: 'timeout' }, { cause: error });
    }
    if (error.response === undefined) {
      return new ApiError({ kind: 'network' }, { cause: error });
    }
    const { status, headers, data } = error.response;
    return new ApiError(detailFromResponse(status, headers, data), { cause: error });
  }

  return new ApiError({ kind: 'unknown' }, { cause: error });
}
