// src/infrastructure/tmdb/tmdb-catalog-repository.ts
import type {
  CatalogPort,
  ImageConfiguration,
  RequestOptions,
} from '@/application/ports/catalog-port';
import type { DiscoverFilters } from '@/domain/catalog/discover-filters';
import type { MovieDetail } from '@/domain/catalog/movie-detail';
import type { Genre, MoviePage } from '@/domain/catalog/movie-summary';
import { TMDB_MAX_PAGE } from '@/domain/catalog/movie-summary';
import { requestJson } from '@/infrastructure/http/tmdb-http-client';
import { toMovieDetail, toMoviePage } from './tmdb-mappers';
import {
  genreListSchema,
  imageConfigurationSchema,
  movieDetailSchema,
  moviePageSchema,
} from './tmdb-schemas';

/** Pedir más allá del tope es gastar una petición para recibir un error. */
function clampPage(page: number): number {
  return Math.min(Math.max(Math.trunc(page), 1), TMDB_MAX_PAGE);
}

/**
 * Los filtros del dominio se traducen a los nombres de TMDB acá: ningún
 * componente escribe jamás un `vote_count.gte`.
 */
function toDiscoverParams(filters: DiscoverFilters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(filters.page),
    sort_by: filters.sortBy,
    include_adult: false,
  };

  if (filters.genreId !== null) params.with_genres = filters.genreId;
  if (filters.year !== null) params.primary_release_year = filters.year;
  if (filters.minimumScore !== null) params['vote_average.gte'] = filters.minimumScore;
  if (filters.minimumVotes !== null) params['vote_count.gte'] = filters.minimumVotes;

  return params;
}

/**
 * Implementación HTTP del puerto: valida lo que llega y lo traduce al dominio.
 * El reloj entra por parámetro —no se consulta por dentro— para que las
 * políticas que dependen de "hoy" se puedan probar sin trucos.
 */
export function createTmdbCatalogRepository(now: () => Date = () => new Date()): CatalogPort {
  return {
    async getImageConfiguration(options?: RequestOptions): Promise<ImageConfiguration> {
      const dto = await requestJson(imageConfigurationSchema, {
        url: '/configuration',
        signal: options?.signal,
      });

      return {
        secureBaseUrl: dto.images.secure_base_url,
        posterSizes: dto.images.poster_sizes,
        backdropSizes: dto.images.backdrop_sizes,
        profileSizes: dto.images.profile_sizes,
      };
    },

    async getMovieGenres(options?: RequestOptions): Promise<readonly Genre[]> {
      const dto = await requestJson(genreListSchema, {
        url: '/genre/movie/list',
        signal: options?.signal,
      });

      return dto.genres;
    },

    async getTrendingMoviesOfWeek(page: number, options?: RequestOptions): Promise<MoviePage> {
      const dto = await requestJson(moviePageSchema, {
        url: '/trending/movie/week',
        params: { page: clampPage(page) },
        signal: options?.signal,
      });

      return toMoviePage(dto);
    },

    async discoverMovies(filters: DiscoverFilters, options?: RequestOptions): Promise<MoviePage> {
      const dto = await requestJson(moviePageSchema, {
        url: '/discover/movie',
        params: toDiscoverParams(filters),
        signal: options?.signal,
      });

      return toMoviePage(dto);
    },

    async searchMovies(query: string, page: number, options?: RequestOptions): Promise<MoviePage> {
      const dto = await requestJson(moviePageSchema, {
        url: '/search/movie',
        params: { query: query.trim(), page: clampPage(page), include_adult: false },
        signal: options?.signal,
      });

      return toMoviePage(dto);
    },

    async getMovieDetail(id: number, options?: RequestOptions): Promise<MovieDetail> {
      const dto = await requestJson(movieDetailSchema, {
        url: `/movie/${String(id)}`,
        // Una petición en vez de cuatro: elenco, tráilers y traducciones juntos.
        params: { append_to_response: 'credits,videos,translations' },
        signal: options?.signal,
      });

      return toMovieDetail(dto, now());
    },

    async getRecommendations(
      id: number,
      page: number,
      options?: RequestOptions,
    ): Promise<MoviePage> {
      const dto = await requestJson(moviePageSchema, {
        url: `/movie/${String(id)}/recommendations`,
        params: { page: clampPage(page) },
        signal: options?.signal,
      });

      return toMoviePage(dto);
    },
  };
}
