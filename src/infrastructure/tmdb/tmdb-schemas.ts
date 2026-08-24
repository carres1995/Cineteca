// src/infrastructure/tmdb/tmdb-schemas.ts
import { z } from 'zod';

/**
 * La forma EXACTA en la que TMDB manda las cosas (snake_case incluido). Vive en
 * infraestructura porque es un detalle del proveedor: el dominio nunca la ve.
 */
export const imageConfigurationSchema = z.object({
  images: z.object({
    secure_base_url: z.url(),
    poster_sizes: z.array(z.string()).min(1),
    backdrop_sizes: z.array(z.string()).min(1),
    profile_sizes: z.array(z.string()).min(1),
  }),
});

export const genreListSchema = z.object({
  genres: z.array(z.object({ id: z.int(), name: z.string().min(1) })),
});

export const movieSummarySchema = z.object({
  id: z.int(),
  title: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string().nullish(),
  overview: z.string().nullish(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const moviePageSchema = z.object({
  page: z.int(),
  results: z.array(movieSummarySchema),
  total_pages: z.int(),
  total_results: z.int(),
});

export type MovieSummaryDto = z.infer<typeof movieSummarySchema>;
export type MoviePageDto = z.infer<typeof moviePageSchema>;

/**
 * Ficha completa. El parámetro de expansión trae elenco, vídeos y traducciones
 * en la MISMA petición: sin él, pintar una ficha son cuatro viajes a la red.
 */
export const castMemberSchema = z.object({
  id: z.int(),
  name: z.string(),
  character: z.string().nullish(),
  profile_path: z.string().nullable(),
});

export const videoSchema = z.object({
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().nullish(),
});

export const translationSchema = z.object({
  iso_639_1: z.string(),
  english_name: z.string(),
  data: z.object({ overview: z.string().nullish() }),
});

export const movieDetailSchema = z.object({
  id: z.int(),
  title: z.string(),
  original_title: z.string(),
  tagline: z.string().nullish(),
  overview: z.string().nullish(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullish(),
  runtime: z.number().nullish(),
  budget: z.number(),
  revenue: z.number(),
  status: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  genres: z.array(z.object({ id: z.int(), name: z.string() })),
  credits: z.object({ cast: z.array(castMemberSchema) }),
  videos: z.object({ results: z.array(videoSchema) }),
  translations: z.object({ translations: z.array(translationSchema) }),
});

export type MovieDetailDto = z.infer<typeof movieDetailSchema>;
