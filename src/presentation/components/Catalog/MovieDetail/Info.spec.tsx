// src/presentation/components/Catalog/MovieDetail/Info.spec.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { aMovieDetail } from '@/test/builders';
import { Info } from './Info';

describe('Info', () => {
  it('un presupuesto desconocido se ve como "Sin dato", nunca como $0', () => {
    render(<Info movie={aMovieDetail({ budget: null })} />);

    expect(screen.getByText('Presupuesto').nextElementSibling).toHaveTextContent('Sin dato');
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
  });

  it('un presupuesto conocido se formatea como dinero, no como número suelto', () => {
    render(<Info movie={aMovieDetail()} />);

    expect(screen.getByText('Presupuesto').nextElementSibling).toHaveTextContent(
      /6[.,\s]000[.,\s]000/,
    );
  });

  it('una sinopsis ausente en español ofrece la versión en inglés con su aviso', () => {
    render(
      <Info
        movie={aMovieDetail({
          synopsis: { kind: 'fallback', text: 'An offer you cannot refuse.', language: 'English' },
        })}
      />,
    );

    expect(screen.getByText(/No hay sinopsis en español/)).toBeInTheDocument();
    expect(screen.getByText('An offer you cannot refuse.')).toHaveAttribute('lang', 'en');
  });

  it('sin sinopsis en ningún idioma lo dice, no deja el hueco', () => {
    render(<Info movie={aMovieDetail({ synopsis: { kind: 'none' } })} />);

    expect(screen.getByText('Todavía no hay sinopsis para esta película.')).toBeInTheDocument();
  });

  it('una duración desconocida no se inventa', () => {
    render(<Info movie={aMovieDetail({ runtimeMinutes: null })} />);

    expect(screen.getByText('Duración').nextElementSibling).toHaveTextContent('Sin dato');
  });
});
