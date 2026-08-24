// src/domain/catalog/catalog-extras.spec.ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, isDefaultFilters } from './discover-filters';
import { toSearchParams } from './discover-filters-url';
import { buildImageUrl, pickImageSize } from './image-url';
import { summaryOf } from './movie-detail';
import { aMovieDetail } from '@/test/builders';

describe('pickImageSize', () => {
  it('usa el tamaño pedido cuando el proveedor lo ofrece', () => {
    expect(pickImageSize(['w92', 'w342', 'original'], 'w342')).toBe('w342');
  });

  it('si no está, se queda con el último que sí existe', () => {
    expect(pickImageSize(['w92', 'w154'], 'w342')).toBe('w154');
  });

  it('sin catálogo de tamaños, el original', () => {
    expect(pickImageSize([], 'w342')).toBe('original');
  });
});

describe('buildImageUrl', () => {
  it('compone la URL con base y tamaño', () => {
    expect(buildImageUrl('https://image.tmdb.org/t/p/', 'w342', '/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w342/poster.jpg',
    );
  });

  it('sin ruta no hay URL: no se inventa una imagen rota', () => {
    expect(buildImageUrl('https://image.tmdb.org/t/p/', 'w342', null)).toBeNull();
  });
});

describe('isDefaultFilters', () => {
  it('reconoce la vista sin filtrar', () => {
    expect(isDefaultFilters(DEFAULT_FILTERS)).toBe(true);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, page: 5 })).toBe(true);
  });

  it('cualquier filtro puesto ya no es la vista por defecto', () => {
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, genreId: 28 })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, year: 1999 })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, minimumScore: 7 })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, minimumVotes: 100 })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, sortBy: 'revenue.desc' })).toBe(false);
  });
});

describe('toSearchParams', () => {
  it('escribe la nota y los votos mínimos cuando los hay', () => {
    const params = toSearchParams({ ...DEFAULT_FILTERS, minimumScore: 7, minimumVotes: 500 });

    expect(params.get('nota')).toBe('7');
    expect(params.get('votos')).toBe('500');
  });
});

describe('summaryOf: de ficha a tarjeta', () => {
  it('una película estrenada lleva su fecha', () => {
    expect(summaryOf(aMovieDetail())).toMatchObject({
      id: 238,
      releaseDate: '1972-03-14',
      overview: 'Una familia.',
    });
  });

  it('una sin estrenar lleva la fecha esperada', () => {
    const summary = summaryOf(
      aMovieDetail({ status: { kind: 'upcoming', expectedDate: '2027-01-01' } }),
    );

    expect(summary.releaseDate).toBe('2027-01-01');
  });

  it('una cancelada o de estado desconocido no inventa fecha', () => {
    expect(summaryOf(aMovieDetail({ status: { kind: 'canceled' } })).releaseDate).toBeNull();
    expect(summaryOf(aMovieDetail({ status: { kind: 'unknown' } })).releaseDate).toBeNull();
  });

  it('sin sinopsis, la tarjeta tampoco la inventa', () => {
    expect(summaryOf(aMovieDetail({ synopsis: { kind: 'none' } })).overview).toBeNull();
  });
});
