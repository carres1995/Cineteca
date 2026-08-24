// src/presentation/components/Library/SaveMovieButton.spec.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/domain/errors/api-error';
import { aMovie } from '@/test/builders';
import { createFakeLibrary, renderWithProviders } from '@/test/render';
import { SaveMovieButton } from './SaveMovieButton';

describe('SaveMovieButton', () => {
  it('guarda al instante y el estado se dice con palabras, no con color', async () => {
    renderWithProviders(<SaveMovieButton movie={aMovie()} />);

    const button = await screen.findByRole('button', {
      name: 'Guardar El padrino en mi cineteca',
    });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Mientras la biblioteca no cargó, el botón está deshabilitado a propósito.
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await userEvent.click(button);

    const saved = await screen.findByRole('button', {
      name: 'Quitar El padrino de mi cineteca',
    });
    expect(saved).toHaveAttribute('aria-pressed', 'true');
  });

  it('si la escritura falla, el corazón vuelve solo a su sitio', async () => {
    const save = vi.fn().mockRejectedValue(new ApiError({ kind: 'storageWrite' }));
    const library = createFakeLibrary();
    library.save = save;

    renderWithProviders(<SaveMovieButton movie={aMovie()} />, { library });

    const button = await screen.findByRole('button', {
      name: 'Guardar El padrino en mi cineteca',
    });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await userEvent.click(button);

    await waitFor(() => {
      expect(save).toHaveBeenCalled();
    });

    // Vuelta atrás: la biblioteca no se quedó con algo que el disco rechazó.
    expect(
      await screen.findByRole('button', { name: 'Guardar El padrino en mi cineteca' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
