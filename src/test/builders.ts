// src/test/builders.ts
import type { MovieDetail } from '@/domain/catalog/movie-detail';
import type { MoviePage, MovieSummary } from '@/domain/catalog/movie-summary';

/**
 * Constructores de datos del DOMINIO (no DTOs de TMDB): las pruebas de pantalla
 * describen qué se ve, no cómo viaja.
 */
export function aMovie(overrides: Partial<MovieSummary> = {}): MovieSummary {
  return {
    id: 238,
    title: 'El padrino',
    posterPath: '/poster.jpg',
    releaseDate: '1972-03-14',
    overview: 'Una familia.',
    rating: { kind: 'consolidated', average: 8.7, voteCount: 20_000 },
    ...overrides,
  };
}

export function aPage(overrides: Partial<MoviePage> = {}): MoviePage {
  return {
    page: 1,
    results: [aMovie()],
    totalPages: 1,
    totalResults: 1,
    ...overrides,
  };
}

export function aMovieDetail(overrides: Partial<MovieDetail> = {}): MovieDetail {
  return {
    id: 238,
    title: 'El padrino',
    originalTitle: 'The Godfather',
    tagline: 'Una oferta que no podrás rechazar.',
    posterPath: '/poster.jpg',
    backdropPath: '/backdrop.jpg',
    synopsis: { kind: 'localized', text: 'Una familia.' },
    runtimeMinutes: 175,
    budget: { amountInMinorUnits: 600_000_000, currency: 'USD' },
    revenue: { amountInMinorUnits: 24_506_641_100, currency: 'USD' },
    genres: [{ id: 18, name: 'Drama' }],
    status: { kind: 'released', releaseDate: '1972-03-14' },
    rating: { kind: 'consolidated', average: 8.7, voteCount: 20_000 },
    cast: [{ id: 1, name: 'Marlon Brando', character: 'Don Vito', profilePath: '/vito.jpg' }],
    trailer: { key: 'abc123', name: 'Tráiler', site: 'YouTube' },
    ...overrides,
  };
}
