// src/domain/catalog/movie-detail.ts
import type { Money } from '@/domain/money/money';
import type { Genre, MovieSummary } from './movie-summary';
import type { Rating } from './rating';
import type { ReleaseStatus } from './release-status';

/**
 * La sinopsis que no existe en el idioma pedido NO es un error de red ni un
 * hueco: es un estado del producto. Por eso es una unión, y la rama de respaldo
 * carga el idioma en el que sí existe, para poder avisarlo.
 */
export type Synopsis =
  | { readonly kind: 'none' }
  | { readonly kind: 'localized'; readonly text: string }
  | { readonly kind: 'fallback'; readonly text: string; readonly language: string };

export interface CastMember {
  readonly id: number;
  readonly name: string;
  readonly character: string | null;
  readonly profilePath: string | null;
}

/** Solo tráilers reproducibles: si no sabemos incrustarlo, no existe. */
export interface Trailer {
  readonly key: string;
  readonly name: string;
  readonly site: 'YouTube';
}

export interface MovieDetail {
  readonly id: number;
  readonly title: string;
  readonly originalTitle: string;
  readonly tagline: string | null;
  readonly posterPath: string | null;
  readonly backdropPath: string | null;
  readonly synopsis: Synopsis;
  readonly runtimeMinutes: number | null;
  readonly budget: Money | null;
  readonly revenue: Money | null;
  readonly genres: readonly Genre[];
  readonly status: ReleaseStatus;
  readonly rating: Rating;
  readonly cast: readonly CastMember[];
  readonly trailer: Trailer | null;
}

/**
 * La biblioteca guarda fichas resumidas: si mañana no hay red, lo guardado se
 * sigue viendo. Esta es la única traducción ficha → tarjeta, y vive en el
 * dominio para que no la reinvente cada pantalla.
 */
export function summaryOf(movie: MovieDetail): MovieSummary {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: releaseDateOf(movie.status),
    overview: movie.synopsis.kind === 'none' ? null : movie.synopsis.text,
    rating: movie.rating,
  };
}

function releaseDateOf(status: ReleaseStatus): string | null {
  switch (status.kind) {
    case 'released':
      return status.releaseDate;
    case 'upcoming':
      return status.expectedDate;
    case 'canceled':
    case 'unknown':
      return null;
  }
}
