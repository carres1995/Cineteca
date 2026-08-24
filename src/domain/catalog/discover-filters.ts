// src/domain/catalog/discover-filters.ts
/**
 * Los filtros de Explorar viven en la URL, y la URL es un borde no confiable:
 * este módulo define qué es un filtro válido para que un `?year=abc` escrito a
 * mano caiga con elegancia a los valores por defecto en vez de romper nada.
 */
export const SORT_OPTIONS = [
  'popularity.desc',
  'vote_average.desc',
  'primary_release_date.desc',
  'revenue.desc',
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export interface DiscoverFilters {
  readonly genreId: number | null;
  readonly year: number | null;
  readonly minimumScore: number | null;
  readonly minimumVotes: number | null;
  readonly sortBy: SortOption;
  readonly page: number;
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  genreId: null,
  year: null,
  minimumScore: null,
  minimumVotes: null,
  sortBy: 'popularity.desc',
  page: 1,
};

/** El cine no existe antes de 1874, y "el año que viene" tampoco es un filtro. */
export const EARLIEST_YEAR = 1874;

export function isDefaultFilters(filters: DiscoverFilters): boolean {
  return (
    filters.genreId === null &&
    filters.year === null &&
    filters.minimumScore === null &&
    filters.minimumVotes === null &&
    filters.sortBy === DEFAULT_FILTERS.sortBy
  );
}
