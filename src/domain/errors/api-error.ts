// src/domain/errors/api-error.ts
/**
 * El vocabulario de fallos del producto. Se traduce UNA vez, en el borde
 * (infrastructure/http), y de aquí para dentro nadie vuelve a ver un error
 * crudo de la librería HTTP: la presentación hace `switch` sobre `kind` y el
 * compilador la obliga a cubrir cada variante.
 */
export type ApiErrorDetail =
  | { readonly kind: 'network' }
  | { readonly kind: 'timeout' }
  | { readonly kind: 'canceled' }
  | { readonly kind: 'unauthorized' }
  | { readonly kind: 'notFound' }
  | { readonly kind: 'invalidRequest'; readonly detail: string }
  | { readonly kind: 'rateLimited'; readonly retryAfterMs: number }
  | { readonly kind: 'server'; readonly status: number }
  /** La respuesta llegó, pero no cumple el contrato: es un fallo, no un dato. */
  | { readonly kind: 'invalidResponse'; readonly detail: string }
  /** El almacenamiento del navegador rechazó la escritura (cuota, modo privado). */
  | { readonly kind: 'storageWrite' }
  | { readonly kind: 'unknown' };

export class ApiError extends Error {
  readonly detail: ApiErrorDetail;

  constructor(detail: ApiErrorDetail, options?: ErrorOptions) {
    super(`ApiError:${detail.kind}`, options);
    this.name = 'ApiError';
    this.detail = detail;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** ¿Vale la pena reintentar? Lo decide el dominio, no la caché. */
export function isRetryable(detail: ApiErrorDetail): boolean {
  switch (detail.kind) {
    case 'network':
    case 'timeout':
    case 'server':
    case 'rateLimited':
      return true;
    case 'canceled':
    case 'unauthorized':
    case 'notFound':
    case 'invalidRequest':
    case 'invalidResponse':
    case 'storageWrite':
    case 'unknown':
      return false;
  }
}
