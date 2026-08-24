// src/presentation/hooks/use-catalog-queries.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { DiscoverFilters } from '@/domain/catalog/discover-filters';
import { normalizeQuery } from '@/domain/catalog/discover-filters-url';
import { useCatalog } from '@/presentation/providers/catalog-provider';
import { catalogKeys } from './catalog-keys';

const MINUTE = 60 * 1_000;
const HOUR = 60 * MINUTE;

/** La configuración de imágenes cambia una vez cada nunca: se pide una vez. */
export function useImageConfiguration() {
  const catalog = useCatalog();

  return useQuery({
    queryKey: catalogKeys.configuration(),
    queryFn: ({ signal }) => catalog.getImageConfiguration({ signal }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/** Los géneros se mueven un par de veces al año: un día de frescura sobra. */
export function useMovieGenres() {
  const catalog = useCatalog();

  return useQuery({
    queryKey: catalogKeys.genres(),
    queryFn: ({ signal }) => catalog.getMovieGenres({ signal }),
    staleTime: 24 * HOUR,
  });
}

/** Las tendencias son semanales: revalidar cada hora es de sobra. */
export function useTrendingMovies(page = 1) {
  const catalog = useCatalog();

  return useQuery({
    queryKey: catalogKeys.trendingPage(page),
    queryFn: ({ signal }) => catalog.getTrendingMoviesOfWeek(page, { signal }),
    staleTime: HOUR,
  });
}

/**
 * Paginación infinita: la página siguiente sale de lo que respondió la anterior,
 * y `totalPages` ya viene recortado al tope duro de TMDB. Cuando no hay
 * siguiente, `getNextPageParam` devuelve `undefined` y la caché deja de pedir.
 */
export function useDiscoverMovies(filters: DiscoverFilters) {
  const catalog = useCatalog();

  return useInfiniteQuery({
    queryKey: catalogKeys.discoverBy(filters),
    queryFn: ({ pageParam, signal }) =>
      catalog.discoverMovies({ ...filters, page: pageParam }, { signal }),
    initialPageParam: filters.page,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 5 * MINUTE,
  });
}

/** Sin texto no hay búsqueda: `enabled` evita la petición vacía. */
export function useSearchMovies(query: string) {
  const catalog = useCatalog();
  const normalized = normalizeQuery(query);

  return useInfiniteQuery({
    queryKey: catalogKeys.searchBy(normalized),
    queryFn: ({ pageParam, signal }) => catalog.searchMovies(normalized, pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: normalized.length > 0,
    staleTime: 5 * MINUTE,
  });
}

/** Una ficha cambia poco y se comparte mucho: media hora de frescura. */
export function useMovieDetail(id: number) {
  const catalog = useCatalog();

  return useQuery({
    queryKey: catalogKeys.movie(id),
    queryFn: ({ signal }) => catalog.getMovieDetail(id, { signal }),
    staleTime: 30 * MINUTE,
  });
}

export function useRecommendations(id: number) {
  const catalog = useCatalog();

  return useQuery({
    queryKey: catalogKeys.recommendations(id),
    queryFn: ({ signal }) => catalog.getRecommendations(id, 1, { signal }),
    staleTime: 30 * MINUTE,
  });
}
