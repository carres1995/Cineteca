// src/presentation/providers/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { isApiError, isRetryable } from '@/domain/errors/api-error';

const MAX_RETRIES = 2;
const MAX_BACKOFF_MS = 30_000;

/**
 * Reintentar un 404 o un token inválido es gastar red para recibir el mismo
 * "no". Quién es reintentable lo decide el dominio; la caché solo obedece.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (!isApiError(error)) return false;
          // Un límite de tasa se respeta UNA vez; dos es un bucle.
          if (error.detail.kind === 'rateLimited') return failureCount < 1;
          return isRetryable(error.detail) && failureCount < MAX_RETRIES;
        },
        retryDelay: (attempt, error) =>
          isApiError(error) && error.detail.kind === 'rateLimited'
            ? error.detail.retryAfterMs
            : Math.min(1_000 * 2 ** attempt, MAX_BACKOFF_MS),
        refetchOnWindowFocus: false,
      },
    },
  });
}
