// src/domain/catalog/rating.ts
/**
 * Una valoración no es un número: son tres situaciones distintas. Sin votos no
 * hay un 0,0 que mostrar —hay ausencia de dato—, y una nota con cuatro votos no
 * es la misma cosa que una con cuarenta mil.
 */
export type Rating =
  | { readonly kind: 'unrated' }
  | { readonly kind: 'provisional'; readonly average: number; readonly voteCount: number }
  | { readonly kind: 'consolidated'; readonly average: number; readonly voteCount: number };

/** Umbral por defecto. Entra por parámetro para que la política sea probable. */
export const CONSOLIDATED_VOTE_THRESHOLD = 50;

export function ratingFrom(
  average: number,
  voteCount: number,
  threshold: number = CONSOLIDATED_VOTE_THRESHOLD,
): Rating {
  if (voteCount <= 0) return { kind: 'unrated' };
  return voteCount >= threshold
    ? { kind: 'consolidated', average, voteCount }
    : { kind: 'provisional', average, voteCount };
}
