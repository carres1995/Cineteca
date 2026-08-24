// src/domain/catalog/movie-summary.ts
import type { Rating } from './rating';

/**
 * La ficha mínima que pinta una tarjeta. `null` significa "no hay dato" y es la
 * única forma de decirlo: ni `0`, ni cadena vacía, ni `undefined`.
 */
export interface MovieSummary {
  readonly id: number;
  readonly title: string;
  readonly posterPath: string | null;
  /** ISO `YYYY-MM-DD`. TMDB manda `''` cuando no la sabe; aquí ya es `null`. */
  readonly releaseDate: string | null;
  /** `null` cuando TMDB no tiene sinopsis en el idioma pedido. */
  readonly overview: string | null;
  readonly rating: Rating;
}

export interface Genre {
  readonly id: number;
  readonly name: string;
}

/** Una página del catálogo, ya con el tope duro de TMDB aplicado. */
export interface MoviePage {
  readonly page: number;
  readonly results: readonly MovieSummary[];
  readonly totalResults: number;
  /** Páginas realmente servibles: TMDB no entrega más allá de la 500. */
  readonly totalPages: number;
}

/** TMDB no sirve resultados más allá de esta página, diga lo que diga el JSON. */
export const TMDB_MAX_PAGE = 500;
