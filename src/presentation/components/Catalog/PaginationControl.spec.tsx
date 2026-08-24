// src/presentation/components/Catalog/PaginationControl.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PaginationControl } from './PaginationControl';

describe('PaginationControl', () => {
  it('pide la página siguiente cuando quedan páginas', async () => {
    const onLoadMore = vi.fn();
    render(
      <PaginationControl page={1} totalPages={10} isLoadingMore={false} onLoadMore={onLoadMore} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cargar más' }));

    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('bloquea el botón mientras vuela la petición', () => {
    render(<PaginationControl page={1} totalPages={10} isLoadingMore onLoadMore={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cargando…' })).toBeDisabled();
  });

  it('al llegar al tope de la API se detiene y lo explica', () => {
    render(
      <PaginationControl page={500} totalPages={500} isLoadingMore={false} onLoadMore={vi.fn()} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/500 páginas/);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('al final de unos resultados normales dice que se acabaron', () => {
    render(
      <PaginationControl page={3} totalPages={3} isLoadingMore={false} onLoadMore={vi.fn()} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Llegaste al final de los resultados.');
  });
});
