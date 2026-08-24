// src/domain/catalog/image-url.ts
/**
 * El catálogo de tamaños lo publica TMDB en `/configuration`: aquí solo se
 * elige uno y se compone la URL. Función pura, cero red.
 */
export function pickImageSize(available: readonly string[], preferred: string): string {
  return available.includes(preferred) ? preferred : (available.at(-1) ?? 'original');
}

/** `null` entra, `null` sale: una película sin póster no inventa una URL rota. */
export function buildImageUrl(
  secureBaseUrl: string,
  size: string,
  path: string | null,
): string | null {
  return path === null ? null : `${secureBaseUrl}${size}${path}`;
}
