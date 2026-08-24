// src/domain/library/library.spec.ts
import { describe, expect, it } from 'vitest';
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import {
  EMPTY_LIBRARY,
  createList,
  deleteList,
  findList,
  isSaved,
  moviesOfList,
  removeMovie,
  renameList,
  saveMovie,
  toggleMovie,
  toggleMovieInList,
  validateListName,
} from './library';

const NOW = '2026-08-24T10:00:00.000Z';

const movie = (id: number): MovieSummary => ({
  id,
  title: `Película ${String(id)}`,
  posterPath: null,
  releaseDate: null,
  overview: null,
  rating: { kind: 'unrated' },
});

const withList = (id: string, name: string, movieIds: number[] = []) =>
  createList(EMPTY_LIBRARY, { id, name, movieIds, createdAt: NOW });

describe('la biblioteca', () => {
  it('empieza vacía', () => {
    expect(EMPTY_LIBRARY).toEqual({ entries: [], lists: [] });
    expect(isSaved(EMPTY_LIBRARY, 1)).toBe(false);
  });

  it('guardar dos veces la misma película no la duplica', () => {
    const once = saveMovie(EMPTY_LIBRARY, movie(1), NOW);
    const twice = saveMovie(once, movie(1), NOW);

    expect(twice.entries).toHaveLength(1);
    expect(twice).toBe(once);
  });

  it('lo último guardado se ve primero', () => {
    const library = saveMovie(saveMovie(EMPTY_LIBRARY, movie(1), NOW), movie(2), NOW);

    expect(library.entries.map((entry) => entry.movie.id)).toEqual([2, 1]);
  });

  it('el corazón alterna', () => {
    const saved = toggleMovie(EMPTY_LIBRARY, movie(1), NOW);

    expect(isSaved(saved, 1)).toBe(true);
    expect(isSaved(toggleMovie(saved, movie(1), NOW), 1)).toBe(false);
  });

  it('quitar una película la saca también de las listas: no quedan huérfanas', () => {
    const withMovie = toggleMovieInList(withList('l1', 'Clásicos'), 'l1', movie(1), NOW);

    expect(findList(withMovie, 'l1')?.movieIds).toEqual([1]);

    const removed = removeMovie(withMovie, 1);

    expect(findList(removed, 'l1')?.movieIds).toEqual([]);
    expect(isSaved(removed, 1)).toBe(false);
  });

  it('agregar a una lista guarda la película si todavía no lo estaba', () => {
    const library = toggleMovieInList(withList('l1', 'Clásicos'), 'l1', movie(7), NOW);
    const list = findList(library, 'l1');

    expect(isSaved(library, 7)).toBe(true);
    expect(list).not.toBeNull();
    expect(moviesOfList(library, list!).map((item) => item.id)).toEqual([7]);
  });

  it('quitar de la lista no quita de la biblioteca', () => {
    const added = toggleMovieInList(withList('l1', 'Clásicos'), 'l1', movie(7), NOW);
    const removed = toggleMovieInList(added, 'l1', movie(7), NOW);

    expect(findList(removed, 'l1')?.movieIds).toEqual([]);
    expect(isSaved(removed, 7)).toBe(true);
  });

  it('tocar una lista no toca las demás', () => {
    const two = createList(withList('l1', 'Clásicos'), {
      id: 'l2',
      name: 'Pendientes',
      movieIds: [],
      createdAt: NOW,
    });

    const library = toggleMovieInList(two, 'l1', movie(3), NOW);

    expect(findList(library, 'l1')?.movieIds).toEqual([3]);
    expect(findList(library, 'l2')?.movieIds).toEqual([]);
  });

  it('agregar a una lista que no existe no hace nada', () => {
    const library = withList('l1', 'Clásicos');

    expect(toggleMovieInList(library, 'inventada', movie(1), NOW)).toBe(library);
  });

  it('renombrar y borrar listas', () => {
    const renamed = renameList(withList('l1', 'Clásicos'), 'l1', 'Cine negro');

    expect(findList(renamed, 'l1')?.name).toBe('Cine negro');
    expect(deleteList(renamed, 'l1').lists).toHaveLength(0);
    expect(findList(deleteList(renamed, 'l1'), 'l1')).toBeNull();
  });

  it('renombrar una lista que no existe deja todo igual', () => {
    const library = withList('l1', 'Clásicos');

    expect(renameList(library, 'otra', 'X').lists[0]?.name).toBe('Clásicos');
  });

  it('una lista ignora ids de películas que ya no están guardadas', () => {
    const library = withList('l1', 'Rotas', [99]);

    expect(moviesOfList(library, library.lists[0]!)).toEqual([]);
  });
});

describe('validateListName: cada bloqueo con su propio motivo', () => {
  const library = withList('l1', 'Clásicos');

  it('sin nombre', () => {
    expect(validateListName(library, '   ')).toBe('empty');
  });

  it('demasiado largo', () => {
    expect(validateListName(library, 'a'.repeat(41))).toBe('tooLong');
  });

  it('repetido, sin importar mayúsculas', () => {
    expect(validateListName(library, 'clásicos')).toBe('duplicated');
  });

  it('renombrar una lista con su propio nombre no es un duplicado', () => {
    expect(validateListName(library, 'Clásicos', 'l1')).toBeNull();
  });

  it('un nombre válido no bloquea nada', () => {
    expect(validateListName(library, 'Cine negro')).toBeNull();
  });
});
