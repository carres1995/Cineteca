// src/test/render.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import type { CatalogPort } from '@/application/ports/catalog-port';
import type { LibraryPort } from '@/application/ports/library-port';
import type { Library } from '@/domain/library/library';
import { EMPTY_LIBRARY } from '@/domain/library/library';
import { CatalogProvider } from '@/presentation/providers/catalog-provider';
import { LibraryProvider } from '@/presentation/providers/library-provider';

/**
 * El doble es del PUERTO, no de Axios ni de la caché: si mañana cambiamos la
 * librería HTTP, estas pruebas no se enteran.
 */
export function createFakeCatalog(overrides: Partial<CatalogPort> = {}): CatalogPort {
  const notImplemented = (name: string) => () =>
    Promise.reject(new Error(`El doble no implementa ${name}`));

  return {
    getImageConfiguration: () =>
      Promise.resolve({
        secureBaseUrl: 'https://image.tmdb.org/t/p/',
        posterSizes: ['w92', 'w342', 'w500', 'original'],
        backdropSizes: ['w300', 'original'],
        profileSizes: ['w185', 'original'],
      }),
    getMovieGenres: () => Promise.resolve([{ id: 28, name: 'Acción' }]),
    getTrendingMoviesOfWeek: notImplemented('getTrendingMoviesOfWeek'),
    discoverMovies: notImplemented('discoverMovies'),
    searchMovies: notImplemented('searchMovies'),
    getMovieDetail: notImplemented('getMovieDetail'),
    getRecommendations: notImplemented('getRecommendations'),
    ...overrides,
  };
}

/** Biblioteca en memoria: mismo puerto, sin depender del navegador. */
export function createFakeLibrary(initial: Library = EMPTY_LIBRARY): LibraryPort {
  let current = initial;

  return {
    load: () => Promise.resolve(current),
    save: (library) => {
      current = library;
      return Promise.resolve();
    },
  };
}

/** Sin reintentos: una prueba que espera tres backoffs no prueba nada, tarda. */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    catalog = createFakeCatalog(),
    library = createFakeLibrary(),
    route = '/',
  }: { catalog?: CatalogPort; library?: LibraryPort; route?: string } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <CatalogProvider catalog={catalog}>
          <LibraryProvider library={library}>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </LibraryProvider>
        </CatalogProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
