// src/presentation/pages/MovieDetailPage.spec.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/domain/errors/api-error';
import { Route, Routes } from 'react-router';
import type { Library } from '@/domain/library/library';
import { EMPTY_LIBRARY } from '@/domain/library/library';
import { aMovieDetail, aPage } from '@/test/builders';
import { createFakeCatalog, createFakeLibrary, renderWithProviders } from '@/test/render';
import MovieDetailPage from './MovieDetailPage';

function renderDetail(
  overrides: Parameters<typeof createFakeCatalog>[0] = {},
  route = '/pelicula/238',
  library: Library = EMPTY_LIBRARY,
) {
  renderWithProviders(
    <Routes>
      <Route path="/pelicula/:id" element={<MovieDetailPage />} />
    </Routes>,
    {
      catalog: createFakeCatalog({
        getMovieDetail: vi.fn().mockResolvedValue(aMovieDetail()),
        getRecommendations: vi.fn().mockResolvedValue(aPage({ results: [] })),
        ...overrides,
      }),
      library: createFakeLibrary(library),
      route,
    },
  );
}

describe('MovieDetailPage', () => {
  it('pinta la ficha completa', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'El padrino' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Una familia.')).toBeInTheDocument();
    expect(screen.getByText('Marlon Brando')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver tráiler' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abc123',
    );
  });

  it('un identificador que no es un número no rompe la pantalla', () => {
    renderDetail({}, '/pelicula/abc');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esta página no existe');
  });

  it('una película que no existe se explica en llano', async () => {
    renderDetail({ getMovieDetail: vi.fn().mockRejectedValue(new ApiError({ kind: 'notFound' })) });

    expect(await screen.findByRole('alert')).toHaveTextContent('No encontramos lo que buscabas.');
  });

  it('sin elenco, sin tráiler y sin datos económicos, la ficha se sostiene', async () => {
    renderDetail({
      getMovieDetail: vi.fn().mockResolvedValue(
        aMovieDetail({
          cast: [],
          trailer: null,
          budget: null,
          revenue: null,
          runtimeMinutes: null,
          tagline: null,
          synopsis: { kind: 'none' },
          rating: { kind: 'unrated' },
          status: { kind: 'upcoming', expectedDate: null },
        }),
      ),
    });

    expect(await screen.findByText('TMDB no tiene el elenco de esta película.')).toBeVisible();
    expect(screen.getByText('Sin estrenar')).toBeVisible();
    expect(screen.getByText('Sin valoraciones')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Ver tráiler' })).not.toBeInTheDocument();
  });

  it('las recomendadas que fallan no tumban la ficha', async () => {
    renderDetail({
      getRecommendations: vi.fn().mockRejectedValue(new ApiError({ kind: 'server', status: 500 })),
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'El padrino' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('También te puede gustar')).not.toBeInTheDocument();
  });

  it('con listas creadas, se puede agregar a una y el estado se dice con palabras', async () => {
    renderDetail({}, '/pelicula/238', {
      entries: [],
      lists: [{ id: 'l1', name: 'Clásicos', movieIds: [], createdAt: '2026-08-24T10:00:00.000Z' }],
    });

    const add = await screen.findByRole('button', { name: 'Agregar Clásicos a la lista' });
    expect(add).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(add);

    expect(
      await screen.findByRole('button', { name: 'Quitar Clásicos de la lista' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('con recomendadas, se ven', async () => {
    renderDetail({ getRecommendations: vi.fn().mockResolvedValue(aPage()) });

    expect(await screen.findByText('También te puede gustar')).toBeVisible();
  });
});
