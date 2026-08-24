// src/presentation/hooks/catalog-keys.ts
import type { DiscoverFilters } from '@/domain/catalog/discover-filters';
import { normalizeQuery } from '@/domain/catalog/discover-filters-url';

/**
 * Claves jerárquicas: invalidar `catalogKeys.all` alcanza a todo el catálogo y
 * `catalogKeys.discover()` solo a Explorar. Sin jerarquía, invalidar termina
 * siendo "borrar toda la caché y rezar".
 *
 * Los filtros se normalizan ANTES de entrar en la clave: la página no forma
 * parte de la identidad de una consulta paginada, y el texto crudo del buscador
 * duplicaría entradas por un espacio de más.
 */
export const catalogKeys = {
  all: ['catalog'] as const,
  configuration: () => [...catalogKeys.all, 'configuration'] as const,
  genres: () => [...catalogKeys.all, 'genres'] as const,
  trending: () => [...catalogKeys.all, 'trending'] as const,
  trendingPage: (page: number) => [...catalogKeys.trending(), { page }] as const,
  discover: () => [...catalogKeys.all, 'discover'] as const,
  discoverBy: (filters: DiscoverFilters) =>
    [
      ...catalogKeys.discover(),
      {
        genreId: filters.genreId,
        year: filters.year,
        minimumScore: filters.minimumScore,
        minimumVotes: filters.minimumVotes,
        sortBy: filters.sortBy,
      },
    ] as const,
  search: () => [...catalogKeys.all, 'search'] as const,
  searchBy: (query: string) => [...catalogKeys.search(), normalizeQuery(query)] as const,
  movie: (id: number) => [...catalogKeys.all, 'movie', id] as const,
  recommendations: (id: number) => [...catalogKeys.movie(id), 'recommendations'] as const,
};
