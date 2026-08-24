// src/infrastructure/storage/local-library-repository.spec.ts
import { describe, expect, it } from 'vitest';
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import { EMPTY_LIBRARY, saveMovie } from '@/domain/library/library';
import { LIBRARY_STORAGE_KEY, createLocalLibraryRepository } from './local-library-repository';

/** Un `Storage` de mentira: el adaptador no depende del navegador para probarse. */
function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));

  return {
    get length() {
      return data.size;
    },
    clear: () => {
      data.clear();
    },
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

const movie: MovieSummary = {
  id: 1,
  title: 'Una película',
  posterPath: null,
  releaseDate: null,
  overview: null,
  rating: { kind: 'unrated' },
};

describe('el adaptador de almacenamiento', () => {
  it('guarda y vuelve a leer', async () => {
    const repository = createLocalLibraryRepository(memoryStorage());

    await repository.save(saveMovie(EMPTY_LIBRARY, movie, '2026-08-24T10:00:00.000Z'));

    await expect(repository.load()).resolves.toMatchObject({ entries: [{ movie: { id: 1 } }] });
  });

  it('un dato corrupto se descarta en vez de romper la lectura', async () => {
    const repository = createLocalLibraryRepository(
      memoryStorage({ [LIBRARY_STORAGE_KEY]: 'basura' }),
    );

    await expect(repository.load()).resolves.toEqual(EMPTY_LIBRARY);
  });

  it('un almacenamiento bloqueado no tumba la lectura', async () => {
    const blocked = memoryStorage();
    blocked.getItem = () => {
      throw new Error('acceso denegado');
    };

    await expect(createLocalLibraryRepository(blocked).load()).resolves.toEqual(EMPTY_LIBRARY);
  });

  it('si la escritura falla, el error viaja con nombre para poder revertir', async () => {
    const full = memoryStorage();
    full.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    await expect(createLocalLibraryRepository(full).save(EMPTY_LIBRARY)).rejects.toMatchObject({
      detail: { kind: 'storageWrite' },
    });
  });
});
