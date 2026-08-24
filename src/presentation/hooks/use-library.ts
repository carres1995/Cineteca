// src/presentation/hooks/use-library.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import type { Library, MovieList } from '@/domain/library/library';
import {
  EMPTY_LIBRARY,
  createList,
  deleteList,
  renameList,
  toggleMovie,
  toggleMovieInList,
} from '@/domain/library/library';
import { useLibraryPort } from '@/presentation/providers/library-provider';

export const libraryKeys = {
  all: ['library'] as const,
};

/**
 * La biblioteca entera es UNA entrada de caché. Por eso "quitar algo" actualiza
 * a la vez la cuadrícula de Explorar, el corazón de la ficha y la pantalla de
 * Mi cineteca: todas leen la misma clave.
 */
export function useLibrary() {
  const port = useLibraryPort();

  return useQuery({
    queryKey: libraryKeys.all,
    queryFn: () => port.load(),
    // El disco local no caduca solo: nadie lo cambia por detrás.
    staleTime: Infinity,
  });
}

/**
 * Toda mutación de la biblioteca sigue el mismo guion: se cancela lo que está
 * en vuelo (si no, una respuesta vieja pisaría lo que el usuario acaba de
 * hacer), se guarda la foto anterior, se pinta el cambio al instante, y si la
 * escritura falla se vuelve atrás.
 */
function useLibraryMutation<TInput>(apply: (library: Library, input: TInput) => Library) {
  const port = useLibraryPort();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      // Se lee del almacenamiento, NO de la caché: la caché ya tiene aplicado
      // el cambio optimista, y volver a aplicarlo sobre ella lo desharía.
      const current = await port.load();
      const next = apply(current, input);
      await port.save(next);
      return next;
    },

    onMutate: async (input: TInput) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.all });
      const previous = queryClient.getQueryData<Library>(libraryKeys.all) ?? EMPTY_LIBRARY;
      queryClient.setQueryData<Library>(libraryKeys.all, apply(previous, input));
      return { previous };
    },

    onError: (_error, _input, context) => {
      // Vuelta atrás: el corazón responde antes que el disco, pero vuelve solo
      // a su sitio cuando el disco dice que no.
      if (context !== undefined) {
        queryClient.setQueryData<Library>(libraryKeys.all, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  });
}

export function useToggleSaved(now: () => Date = () => new Date()) {
  return useLibraryMutation<MovieSummary>((library, movie) =>
    toggleMovie(library, movie, now().toISOString()),
  );
}

export function useCreateList(now: () => Date = () => new Date()) {
  return useLibraryMutation<{ id: string; name: string }>((library, input) =>
    createList(library, {
      id: input.id,
      name: input.name.trim(),
      movieIds: [],
      createdAt: now().toISOString(),
    }),
  );
}

export function useRenameList() {
  return useLibraryMutation<{ id: string; name: string }>((library, input) =>
    renameList(library, input.id, input.name.trim()),
  );
}

export function useDeleteList() {
  return useLibraryMutation<string>((library, listId) => deleteList(library, listId));
}

export function useToggleMovieInList(now: () => Date = () => new Date()) {
  return useLibraryMutation<{ listId: string; movie: MovieSummary }>((library, input) =>
    toggleMovieInList(library, input.listId, input.movie, now().toISOString()),
  );
}

export type { MovieList };
