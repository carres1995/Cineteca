// src/presentation/app/App.spec.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { aPage } from '@/test/builders';
import { createFakeCatalog, renderWithProviders } from '@/test/render';
import App from './App';

function renderApp(route = '/') {
  renderWithProviders(<App />, {
    catalog: createFakeCatalog({
      getTrendingMoviesOfWeek: vi.fn().mockResolvedValue(aPage()),
      searchMovies: vi.fn().mockResolvedValue(aPage()),
    }),
    route,
  });
}

describe('la aplicación completa', () => {
  it('la atribución a TMDB está presente desde el primer render', async () => {
    renderApp();

    expect(await screen.findByText(/no está avalado ni certificado por TMDB/)).toBeInTheDocument();
  });

  it('el primer tabulador lleva al contenido: sin eso, llegar es un vía crucis', async () => {
    renderApp();

    await userEvent.tab();

    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveFocus();
  });

  it('al cambiar de ruta cambian el título del documento y el foco', async () => {
    renderApp();

    // El foco lo mueve un efecto, que corre después de que el encabezado
    // aparece: esperar solo al encabezado deja la prueba a merced del reloj.
    const home = await screen.findByRole('heading', {
      level: 1,
      name: 'Tendencias de la semana',
    });
    await waitFor(() => {
      expect(home).toHaveFocus();
    });
    expect(document.title).toBe('Tendencias de la semana · Cineteca');

    await userEvent.click(screen.getByRole('link', { name: 'Buscar' }));

    const search = await screen.findByRole('heading', { level: 1, name: 'Buscar películas' });
    await waitFor(() => {
      expect(search).toHaveFocus();
    });
    expect(document.title).toBe('Buscar películas · Cineteca');
  });

  it('una ruta que no existe no deja la pantalla en blanco', async () => {
    renderApp('/lo-que-sea');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Esta página no existe' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
