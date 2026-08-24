// src/presentation/components/Common/MovieCard.spec.tsx
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { aMovie } from '@/test/builders';
import { renderWithProviders } from '@/test/render';
import { MovieCard } from './MovieCard';

describe('MovieCard', () => {
  it('es UN enlace con el nombre accesible completo', () => {
    renderWithProviders(<MovieCard movie={aMovie()} posterUrl="https://img/poster.jpg" />);

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('El padrino, 1972, 8,7 de 10 con 20.000 votos');
    expect(links[0]).toHaveAttribute('href', '/pelicula/238');
  });

  it('una película sin votos no finge un 0,0', () => {
    renderWithProviders(
      <MovieCard movie={aMovie({ rating: { kind: 'unrated' } })} posterUrl={null} />,
    );

    expect(screen.getByText('Sin valoraciones')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(/sin valoraciones/i);
  });

  it('una película sin póster muestra marcador de posición, no un icono roto', () => {
    renderWithProviders(<MovieCard movie={aMovie({ posterPath: null })} posterUrl={null} />);

    expect(screen.getByText('Sin póster')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('una película sin fecha lo dice con palabras', () => {
    renderWithProviders(<MovieCard movie={aMovie({ releaseDate: null })} posterUrl={null} />);

    expect(screen.getByText('Sin fecha de estreno')).toBeInTheDocument();
  });
});
