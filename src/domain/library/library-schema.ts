// src/domain/library/library-schema.ts
import { z } from 'zod';
import type { Library } from './library';
import { EMPTY_LIBRARY, LIST_NAME_MAX_LENGTH } from './library';

/**
 * El almacenamiento local es el tercer borde, y se valida al LEER aunque lo
 * haya escrito nuestra propia app: la escribió otra versión del código, o la
 * tocó alguien desde las DevTools, o se quedó a medias. Un dato corrupto se
 * descarta sin tumbar la app.
 */
const ratingSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('unrated') }),
  z.object({ kind: z.literal('provisional'), average: z.number(), voteCount: z.number() }),
  z.object({ kind: z.literal('consolidated'), average: z.number(), voteCount: z.number() }),
]);

const movieSummarySchema = z.object({
  id: z.int(),
  title: z.string(),
  posterPath: z.string().nullable(),
  releaseDate: z.string().nullable(),
  overview: z.string().nullable(),
  rating: ratingSchema,
});

const entrySchema = z.object({
  movie: movieSummarySchema,
  savedAt: z.string(),
});

const listSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(LIST_NAME_MAX_LENGTH),
  movieIds: z.array(z.int()),
  createdAt: z.string(),
});

export const librarySchema = z.object({
  entries: z.array(entrySchema),
  lists: z.array(listSchema),
});

/**
 * Nunca lanza: la biblioteca de alguien no puede ser el motivo de una pantalla
 * en blanco. Si el JSON está roto, se empieza de cero.
 */
export function parseLibrary(raw: string | null): Library {
  if (raw === null) return EMPTY_LIBRARY;

  try {
    const parsed = librarySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_LIBRARY;
  } catch {
    return EMPTY_LIBRARY;
  }
}
