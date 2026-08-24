// src/presentation/components/Catalog/DiscoverFilters.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_FILTERS } from '@/domain/catalog/discover-filters';
import { DiscoverFilters } from './DiscoverFilters';

const genres = [
  { id: 28, name: 'Acción' },
  { id: 18, name: 'Drama' },
];

function renderFilters(filters = DEFAULT_FILTERS) {
  const onChange = vi.fn();
  const onClear = vi.fn();

  render(
    <DiscoverFilters
      filters={filters}
      genres={genres}
      onChange={onChange}
      onClear={onClear}
      currentYear={2026}
    />,
  );

  return { onChange, onClear };
}

describe('DiscoverFilters', () => {
  it('cada control se alcanza por su etiqueta', () => {
    renderFilters();

    expect(screen.getByLabelText('Género')).toBeInTheDocument();
    expect(screen.getByLabelText('Año de estreno')).toBeInTheDocument();
    expect(screen.getByLabelText('Nota mínima')).toBeInTheDocument();
    expect(screen.getByLabelText('Votos mínimos')).toBeInTheDocument();
    expect(screen.getByLabelText('Ordenar por')).toBeInTheDocument();
  });

  it('cambiar un filtro vuelve a la página 1', async () => {
    const { onChange } = renderFilters({ ...DEFAULT_FILTERS, page: 7 });

    await userEvent.selectOptions(screen.getByLabelText('Género'), '18');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ genreId: 18, page: 1 }));
  });

  it('sin filtros aplicados no ofrece limpiarlos: no hay nada que limpiar', () => {
    renderFilters();

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('con filtros aplicados ofrece la salida', async () => {
    const { onClear } = renderFilters({ ...DEFAULT_FILTERS, genreId: 28 });

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(onClear).toHaveBeenCalledOnce();
  });
});
