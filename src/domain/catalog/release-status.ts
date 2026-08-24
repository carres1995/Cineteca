// src/domain/catalog/release-status.ts
/**
 * El estado de una película, como conjunto cerrado de variantes: cada rama trae
 * EXACTAMENTE los datos que le corresponden. Si mañana TMDB agrega un estado,
 * el `switch` de la pantalla deja de compilar, que es justo lo que queremos.
 */
export type ReleaseStatus =
  | { readonly kind: 'released'; readonly releaseDate: string }
  | { readonly kind: 'upcoming'; readonly expectedDate: string | null }
  | { readonly kind: 'canceled' }
  | { readonly kind: 'unknown' };

/** Los literales que manda TMDB en `status`. */
const RELEASED = 'Released';
const CANCELED = 'Canceled';
const IN_PROGRESS = new Set(['Post Production', 'In Production', 'Planned', 'Rumored']);

/**
 * La fecha de estreno se compara contra un "hoy" que entra por parámetro: una
 * política que consulta el reloj por dentro no se puede probar sin trucos.
 */
export function releaseStatusFrom(
  tmdbStatus: string,
  releaseDate: string | null,
  today: Date,
): ReleaseStatus {
  if (tmdbStatus === CANCELED) return { kind: 'canceled' };

  if (tmdbStatus === RELEASED) {
    return releaseDate === null ? { kind: 'unknown' } : { kind: 'released', releaseDate };
  }

  if (IN_PROGRESS.has(tmdbStatus)) return { kind: 'upcoming', expectedDate: releaseDate };

  // Sin estado utilizable, la fecha decide: lo que aún no llegó, no se estrenó.
  if (releaseDate === null) return { kind: 'unknown' };

  return new Date(releaseDate).getTime() > today.getTime()
    ? { kind: 'upcoming', expectedDate: releaseDate }
    : { kind: 'released', releaseDate };
}
