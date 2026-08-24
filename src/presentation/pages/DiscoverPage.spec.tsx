// src/presentation/pages/DiscoverPage.spec.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/domain/errors/api-error';
import { aMovie, aPage } from '@/test/builders';
import { createFakeCatalog, renderWithProviders } from '@/test/render';
import DiscoverPage from './DiscoverPage';

function renderDiscover(discoverMovies = vi.fn().mockResolvedValue(aPage()), route = '/explorar') {
  renderWithProviders(<DiscoverPage />, {
    catalog: createFakeCatalog({ discoverMovies }),
    route,
  });

  return { discoverMovies };
}

describe('DiscoverPage: los cuatro estados y los filtros en la URL', () => {
  it('carga: esqueleto con la forma de las tarjetas, no un spinner', () => {
    renderDiscover(vi.fn().mockReturnValue(new Promise(() => undefined)));

    expect(screen.getByRole('status')).toHaveTextContent('Cargando películas…');
  });

  it('error: lenguaje llano y un botón que reintenta', async () => {
    const discoverMovies = vi
      .fn()
      .mockRejectedValueOnce(new ApiError({ kind: 'network' }))
      .mockResolvedValue(aPage());

    renderDiscover(discoverMovies);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos conectarnos.');

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('link', { name: /El padrino/ })).toBeInTheDocument();
  });

  it('vacío por filtro: ofrece limpiarlos, y al hacerlo vuelve a haber resultados', async () => {
    const discoverMovies = vi
      .fn()
      .mockImplementation((filters: { genreId: number | null }) =>
        Promise.resolve(
          filters.genreId === null ? aPage() : aPage({ results: [], totalResults: 0 }),
        ),
      );

    renderDiscover(discoverMovies, '/explorar?genero=28');

    expect(await screen.findByText('Ninguna película coincide con estos filtros.')).toBeVisible();

    // Hay dos salidas con el mismo nombre: la de la barra de filtros y la del
    // vacío. La que importa acá es la que convierte el callejón en una acción.
    const [, fromEmptyState] = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    await userEvent.click(fromEmptyState!);

    expect(await screen.findByRole('link', { name: /El padrino/ })).toBeInTheDocument();
  });

  it('los filtros de la URL llegan a la petición tal cual', async () => {
    const { discoverMovies } = renderDiscover(
      vi.fn().mockResolvedValue(aPage()),
      '/explorar?genero=18&anio=1972&nota=7&votos=500&orden=revenue.desc',
    );

    await waitFor(() => {
      expect(discoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          genreId: 18,
          year: 1972,
          minimumScore: 7,
          minimumVotes: 500,
          sortBy: 'revenue.desc',
        }),
        expect.anything(),
      );
    });
  });

  it('un filtro absurdo escrito a mano no rompe la pantalla', async () => {
    const { discoverMovies } = renderDiscover(
      vi.fn().mockResolvedValue(aPage()),
      '/explorar?anio=abc&orden=inventado&pagina=-2',
    );

    await waitFor(() => {
      expect(discoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ year: null, sortBy: 'popularity.desc', page: 1 }),
        expect.anything(),
      );
    });
    expect(await screen.findByRole('link', { name: /El padrino/ })).toBeInTheDocument();
  });

  it('cambiar un filtro lo escribe en la URL', async () => {
    const { discoverMovies } = renderDiscover();

    await screen.findByRole('link', { name: /El padrino/ });
    await userEvent.selectOptions(screen.getByLabelText('Género'), '28');

    await waitFor(() => {
      expect(discoverMovies).toHaveBeenLastCalledWith(
        expect.objectContaining({ genreId: 28 }),
        expect.anything(),
      );
    });
  });

  it('la paginación se detiene con un mensaje al llegar al tope de la API', async () => {
    renderDiscover(
      vi.fn().mockResolvedValue(aPage({ results: [aMovie()], page: 500, totalPages: 500 })),
    );

    expect(await screen.findByText(/500 páginas/)).toBeInTheDocument();
  });
});
