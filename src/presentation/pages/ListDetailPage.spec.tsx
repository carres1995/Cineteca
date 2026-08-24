// src/presentation/pages/ListDetailPage.spec.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Library } from '@/domain/library/library';
import { aMovie } from '@/test/builders';
import { createFakeLibrary, renderWithProviders } from '@/test/render';
import ListDetailPage from './ListDetailPage';

const NOW = '2026-08-24T10:00:00.000Z';

const library: Library = {
  entries: [{ movie: aMovie(), savedAt: NOW }],
  lists: [{ id: 'l1', name: 'Clásicos', movieIds: [238], createdAt: NOW }],
};

function renderList(route: string, initial: Library = library) {
  renderWithProviders(
    <Routes>
      <Route path="/cineteca/listas/:id" element={<ListDetailPage />} />
    </Routes>,
    { library: createFakeLibrary(initial), route },
  );
}

describe('ListDetailPage', () => {
  it('muestra la lista con sus películas', async () => {
    renderList('/cineteca/listas/l1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Clásicos' })).toBeInTheDocument();
    expect(screen.getByText('1 película')).toBeVisible();
    expect(screen.getByRole('link', { name: /El padrino/ })).toBeInTheDocument();
  });

  it('un identificador inventado en la URL no rompe nada', async () => {
    renderList('/cineteca/listas/no-existe');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Esa lista no existe' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mi cineteca' })).toHaveAttribute('href', '/cineteca');
  });

  it('una lista vacía ofrece por dónde llenarla', async () => {
    renderList('/cineteca/listas/l1', {
      entries: [],
      lists: [{ id: 'l1', name: 'Clásicos', movieIds: [], createdAt: NOW }],
    });

    expect(await screen.findByText('Esta lista todavía no tiene películas.')).toBeVisible();
  });

  it('renombrar la lista se ve al instante', async () => {
    renderList('/cineteca/listas/l1');

    const input = await screen.findByLabelText('Nombre de la lista');
    await userEvent.clear(input);
    await userEvent.type(input, 'Cine negro');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar nombre' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cine negro' }),
    ).toBeInTheDocument();
  });
});
