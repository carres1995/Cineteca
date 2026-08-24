// src/presentation/pages/LibraryPage.spec.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Library } from '@/domain/library/library';
import { aMovie } from '@/test/builders';
import { createFakeLibrary, renderWithProviders } from '@/test/render';
import LibraryPage from './LibraryPage';

const withMovie: Library = {
  entries: [{ movie: aMovie(), savedAt: '2026-08-24T10:00:00.000Z' }],
  lists: [],
};

describe('LibraryPage', () => {
  it('vacía: lo dice y ofrece la salida, no un callejón', async () => {
    renderWithProviders(<LibraryPage />, { route: '/cineteca' });

    expect(await screen.findByText('Tu cineteca está vacía')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/explorar');
  });

  it('con películas guardadas, las muestra', async () => {
    renderWithProviders(<LibraryPage />, {
      library: createFakeLibrary(withMovie),
      route: '/cineteca',
    });

    expect(await screen.findByRole('link', { name: /El padrino/ })).toBeInTheDocument();
  });

  it('crea una lista y la muestra al instante', async () => {
    renderWithProviders(<LibraryPage />, {
      library: createFakeLibrary(withMovie),
      route: '/cineteca',
    });

    await userEvent.type(await screen.findByLabelText('Nombre de la lista'), 'Cine negro');
    await userEvent.click(screen.getByRole('button', { name: 'Crear lista' }));

    expect(await screen.findByRole('link', { name: 'Cine negro' })).toBeInTheDocument();
    expect(screen.getByText('0 películas')).toBeVisible();
  });

  it('borra una lista', async () => {
    const library = createFakeLibrary({
      entries: [],
      lists: [{ id: 'l1', name: 'Clásicos', movieIds: [], createdAt: '2026-08-24T10:00:00.000Z' }],
    });

    renderWithProviders(<LibraryPage />, { library, route: '/cineteca' });

    await userEvent.click(await screen.findByRole('button', { name: 'Borrar la lista Clásicos' }));

    await waitFor(() => {
      expect(screen.getByText('Todavía no creaste ninguna lista.')).toBeVisible();
    });
  });
});
