// src/infrastructure/storage/local-library-repository.ts
import type { LibraryPort } from '@/application/ports/library-port';
import { ApiError } from '@/domain/errors/api-error';
import type { Library } from '@/domain/library/library';
import { EMPTY_LIBRARY } from '@/domain/library/library';
import { parseLibrary } from '@/domain/library/library-schema';

/** La versión va en la clave: mañana cambia la forma y no rompemos lo guardado. */
export const LIBRARY_STORAGE_KEY = 'cineteca:library:v1';

/**
 * Implementación del puerto sobre el almacenamiento del navegador. Leer nunca
 * falla —un dato corrupto se descarta—; escribir sí puede fallar (cuota llena,
 * modo privado), y por eso el error viaja como `ApiError` y la pantalla puede
 * revertir la acción optimista.
 */
export function createLocalLibraryRepository(storage: Storage = localStorage): LibraryPort {
  return {
    load(): Promise<Library> {
      try {
        return Promise.resolve(parseLibrary(storage.getItem(LIBRARY_STORAGE_KEY)));
      } catch {
        // Un navegador con el almacenamiento bloqueado no es una app rota.
        return Promise.resolve(EMPTY_LIBRARY);
      }
    },

    save(library: Library): Promise<void> {
      try {
        storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(new ApiError({ kind: 'storageWrite' }, { cause: error }));
      }
    },
  };
}
