// src/presentation/pages/SearchPage.spec.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aPage } from '@/test/builders';
import { createFakeCatalog, renderWithProviders } from '@/test/render';
import SearchPage from './SearchPage';

describe('SearchPage', () => {
  beforeEach(() => {
    // Reloj controlado: cero esperas reales, resultado siempre el mismo.
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('teclear nueve letras dispara UNA petición, no nueve', async () => {
    const searchMovies = vi.fn().mockResolvedValue(aPage());
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });

    renderWithProviders(<SearchPage />, {
      catalog: createFakeCatalog({ searchMovies }),
      route: '/buscar',
    });

    await user.type(screen.getByLabelText('Buscar películas por título'), 'elpadrino');
    expect(searchMovies).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(searchMovies).toHaveBeenCalledOnce();
    });
    expect(searchMovies).toHaveBeenCalledWith('elpadrino', 1, expect.anything());
  });

  it('sin texto no gasta una petición y ofrece por dónde empezar', () => {
    const searchMovies = vi.fn().mockResolvedValue(aPage());

    renderWithProviders(<SearchPage />, {
      catalog: createFakeCatalog({ searchMovies }),
      route: '/buscar',
    });

    expect(searchMovies).not.toHaveBeenCalled();
    expect(screen.getByText('Escribí algo para empezar a buscar.')).toBeInTheDocument();
  });

  it('una búsqueda sin resultados no es un callejón mudo', async () => {
    const searchMovies = vi.fn().mockResolvedValue(aPage({ results: [], totalResults: 0 }));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });

    renderWithProviders(<SearchPage />, {
      catalog: createFakeCatalog({ searchMovies }),
      route: '/buscar',
    });

    await user.type(screen.getByLabelText('Buscar películas por título'), 'zzzz');
    vi.advanceTimersByTime(500);

    expect(await screen.findByText(/No encontramos nada para/)).toBeInTheDocument();
  });
});
