// src/infrastructure/http/tmdb-http-client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { ApiError } from '@/domain/errors/api-error';
import { credential, env } from '@/infrastructure/config/env';
import { toApiError } from './map-http-error';

/** Idioma del CONTENIDO (títulos y sinopsis). Los formatos los pone el navegador. */
export const TMDB_LANGUAGE = 'es-ES';
export const REQUEST_TIMEOUT_MS = 10_000;

export function createTmdbHttpClient(): AxiosInstance {
  // La credencial es de solo lectura: viaja en el bundle y es pública a
  // propósito. Cada variante viaja por donde TMDB la espera.
  const auth =
    credential.kind === 'readAccessToken'
      ? { headers: { Authorization: `Bearer ${credential.token}` }, params: {} }
      : { headers: {}, params: { api_key: credential.key } };

  const client = axios.create({
    baseURL: `${env.VITE_TMDB_API_BASE}/3`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { ...auth.headers, Accept: 'application/json' },
    params: { ...auth.params, language: TMDB_LANGUAGE },
  });

  // Hacia dentro solo cruzan ApiError: ningún componente conoce a Axios.
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

export const tmdbHttp = createTmdbHttpClient();

/**
 * Toda respuesta se valida antes de existir para el resto de la app. Si el
 * contrato se rompe, el fallo es localizado y con nombre —`invalidResponse`—,
 * no un `undefined` que estalla tres componentes más adentro.
 */
export async function requestJson<T>(schema: z.ZodType<T>, config: AxiosRequestConfig): Promise<T> {
  const response = await tmdbHttp.request<unknown>(config);
  const parsed = schema.safeParse(response.data);

  if (!parsed.success) {
    throw new ApiError({
      kind: 'invalidResponse',
      detail: `${String(config.url)}: ${z.prettifyError(parsed.error)}`,
    });
  }

  return parsed.data;
}
