// src/application/ports/catalog-port.ts
import type { DiscoverFilters } from '@/domain/catalog/discover-filters';
import type { MovieDetail } from '@/domain/catalog/movie-detail';
import type { Genre, MoviePage } from '@/domain/catalog/movie-summary';

/** Cancelación: la trae quien llama (React Query pasa su propio `signal`). */
export interface RequestOptions {
  readonly signal?: AbortSignal;
}

/** El catálogo de imágenes lo publica el propio proveedor; no se hardcodea. */
export interface ImageConfiguration {
  readonly secureBaseUrl: string;
  readonly posterSizes: readonly string[];
  readonly backdropSizes: readonly string[];
  readonly profileSizes: readonly string[];
}

/**
 * "Algo que trae películas". La aplicación no sabe que hay HTTP detrás, y por
 * eso las pruebas doblan ESTE puerto, no la librería de red.
 */
export interface CatalogPort {
  getImageConfiguration(options?: RequestOptions): Promise<ImageConfiguration>;
  getMovieGenres(options?: RequestOptions): Promise<readonly Genre[]>;
  getTrendingMoviesOfWeek(page: number, options?: RequestOptions): Promise<MoviePage>;
  discoverMovies(filters: DiscoverFilters, options?: RequestOptions): Promise<MoviePage>;
  searchMovies(query: string, page: number, options?: RequestOptions): Promise<MoviePage>;
  getMovieDetail(id: number, options?: RequestOptions): Promise<MovieDetail>;
  getRecommendations(id: number, page: number, options?: RequestOptions): Promise<MoviePage>;
}
