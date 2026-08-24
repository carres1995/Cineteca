// src/domain/catalog/discover-filters-url.ts
import { z } from 'zod';
import type { DiscoverFilters, SortOption } from './discover-filters';
import { DEFAULT_FILTERS, EARLIEST_YEAR, SORT_OPTIONS } from './discover-filters';
import { TMDB_MAX_PAGE } from './movie-summary';

/**
 * La URL es un borde no confiable: `?year=abc&page=-3` se escribe a mano en un
 * segundo. Cada campo se valida por separado y cae con elegancia a su valor por
 * defecto, en vez de romper la pantalla o viajar crudo a la API.
 */
export const FILTER_PARAMS = {
  genre: 'genero',
  year: 'anio',
  score: 'nota',
  votes: 'votos',
  sort: 'orden',
  page: 'pagina',
  query: 'q',
} as const;

function readNumber(raw: string | null, schema: z.ZodType<number>): number | null {
  if (raw === null || raw.trim() === '') return null;

  const parsed = schema.safeParse(Number(raw));
  return parsed.success ? parsed.data : null;
}

const genreSchema = z.int().positive();
const scoreSchema = z.number().min(0).max(10);
const votesSchema = z.int().min(0);
const pageSchema = z.int().min(1).max(TMDB_MAX_PAGE);
const sortSchema = z.enum(SORT_OPTIONS);

export function parseDiscoverFilters(
  params: URLSearchParams,
  currentYear: number,
): DiscoverFilters {
  const yearSchema = z
    .int()
    .min(EARLIEST_YEAR)
    .max(currentYear + 1);
  const sort = sortSchema.safeParse(params.get(FILTER_PARAMS.sort));

  return {
    genreId: readNumber(params.get(FILTER_PARAMS.genre), genreSchema),
    year: readNumber(params.get(FILTER_PARAMS.year), yearSchema),
    minimumScore: readNumber(params.get(FILTER_PARAMS.score), scoreSchema),
    minimumVotes: readNumber(params.get(FILTER_PARAMS.votes), votesSchema),
    sortBy: sort.success ? sort.data : DEFAULT_FILTERS.sortBy,
    page: readNumber(params.get(FILTER_PARAMS.page), pageSchema) ?? DEFAULT_FILTERS.page,
  };
}

/**
 * Solo se escribe lo que se aparta del defecto: una URL con seis parámetros
 * redundantes es imposible de leer y de compartir.
 */
export function toSearchParams(filters: DiscoverFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.genreId !== null) params.set(FILTER_PARAMS.genre, String(filters.genreId));
  if (filters.year !== null) params.set(FILTER_PARAMS.year, String(filters.year));
  if (filters.minimumScore !== null) params.set(FILTER_PARAMS.score, String(filters.minimumScore));
  if (filters.minimumVotes !== null) params.set(FILTER_PARAMS.votes, String(filters.minimumVotes));
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) params.set(FILTER_PARAMS.sort, filters.sortBy);
  if (filters.page !== DEFAULT_FILTERS.page) params.set(FILTER_PARAMS.page, String(filters.page));

  return params;
}

/**
 * La clave de caché no puede llevar el texto crudo: " Padrino " y "padrino" son
 * la misma búsqueda, y si no se normaliza son dos entradas y dos peticiones.
 */
export function normalizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-ES');
}

export type { SortOption };
