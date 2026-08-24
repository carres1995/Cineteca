// src/domain/library/library.ts
import type { MovieSummary } from '@/domain/catalog/movie-summary';

/** Lo guardado: la película entera, para que la biblioteca funcione sin red. */
export interface LibraryEntry {
  readonly movie: MovieSummary;
  /** ISO. Entra por parámetro: el dominio no consulta el reloj. */
  readonly savedAt: string;
}

export interface MovieList {
  readonly id: string;
  readonly name: string;
  readonly movieIds: readonly number[];
  readonly createdAt: string;
}

export interface Library {
  readonly entries: readonly LibraryEntry[];
  readonly lists: readonly MovieList[];
}

export const EMPTY_LIBRARY: Library = { entries: [], lists: [] };

export const LIST_NAME_MAX_LENGTH = 40;

export function isSaved(library: Library, movieId: number): boolean {
  return library.entries.some((entry) => entry.movie.id === movieId);
}

/**
 * Guardar es idempotente: pulsar dos veces el corazón no duplica la película.
 * Lo nuevo va primero, que es como la gente espera ver su biblioteca.
 */
export function saveMovie(library: Library, movie: MovieSummary, savedAt: string): Library {
  if (isSaved(library, movie.id)) return library;

  return { ...library, entries: [{ movie, savedAt }, ...library.entries] };
}

/** Quitar una película la saca también de todas las listas: no quedan huérfanas. */
export function removeMovie(library: Library, movieId: number): Library {
  return {
    entries: library.entries.filter((entry) => entry.movie.id !== movieId),
    lists: library.lists.map((list) => ({
      ...list,
      movieIds: list.movieIds.filter((id) => id !== movieId),
    })),
  };
}

export function toggleMovie(library: Library, movie: MovieSummary, savedAt: string): Library {
  return isSaved(library, movie.id)
    ? removeMovie(library, movie.id)
    : saveMovie(library, movie, savedAt);
}

export function createList(library: Library, list: MovieList): Library {
  return { ...library, lists: [...library.lists, list] };
}

export function renameList(library: Library, listId: string, name: string): Library {
  return {
    ...library,
    lists: library.lists.map((list) => (list.id === listId ? { ...list, name } : list)),
  };
}

export function deleteList(library: Library, listId: string): Library {
  return { ...library, lists: library.lists.filter((list) => list.id !== listId) };
}

export function findList(library: Library, listId: string): MovieList | null {
  return library.lists.find((list) => list.id === listId) ?? null;
}

/**
 * Una lista solo referencia ids: la ficha completa vive una sola vez, en
 * `entries`. Por eso agregar a una lista guarda la película si no lo estaba —si
 * no, la lista apuntaría a algo que la biblioteca no tiene—.
 */
export function toggleMovieInList(
  library: Library,
  listId: string,
  movie: MovieSummary,
  savedAt: string,
): Library {
  const list = findList(library, listId);
  if (list === null) return library;

  const contains = list.movieIds.includes(movie.id);
  const base = contains ? library : saveMovie(library, movie, savedAt);

  return {
    ...base,
    lists: base.lists.map((candidate) =>
      candidate.id === listId
        ? {
            ...candidate,
            movieIds: contains
              ? candidate.movieIds.filter((id) => id !== movie.id)
              : [...candidate.movieIds, movie.id],
          }
        : candidate,
    ),
  };
}

export function moviesOfList(library: Library, list: MovieList): readonly MovieSummary[] {
  return list.movieIds
    .map((id) => library.entries.find((entry) => entry.movie.id === id)?.movie)
    .filter((movie): movie is MovieSummary => movie !== undefined);
}

/**
 * Dos motivos de bloqueo distintos, cada uno con su nombre: un "no se puede"
 * genérico obliga a adivinar qué pasó.
 */
export type ListNameProblem = 'empty' | 'tooLong' | 'duplicated';

export function validateListName(
  library: Library,
  name: string,
  ignoreListId: string | null = null,
): ListNameProblem | null {
  const trimmed = name.trim();

  if (trimmed === '') return 'empty';
  if (trimmed.length > LIST_NAME_MAX_LENGTH) return 'tooLong';

  const duplicated = library.lists.some(
    (list) =>
      list.id !== ignoreListId &&
      list.name.toLocaleLowerCase('es-ES') === trimmed.toLocaleLowerCase('es-ES'),
  );

  return duplicated ? 'duplicated' : null;
}
