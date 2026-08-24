// src/infrastructure/tmdb/tmdb-contract.spec.ts
/**
 * Prueba de contrato: los fixtures son respuestas REALES capturadas de TMDB.
 * Si TMDB cambia una forma, esta prueba se pone roja antes que la pantalla.
 */
import { describe, expect, it } from 'vitest';
import configuration from '@/test/fixtures/configuration.json';
import discover from '@/test/fixtures/discover.json';
import genres from '@/test/fixtures/genres.json';
import movieDetail from '@/test/fixtures/movie-detail.json';
import recommendations from '@/test/fixtures/recommendations.json';
import search from '@/test/fixtures/search.json';
import trending from '@/test/fixtures/trending-week.json';
import { toMovieDetail, toMoviePage } from './tmdb-mappers';
import {
  genreListSchema,
  imageConfigurationSchema,
  movieDetailSchema,
  moviePageSchema,
} from './tmdb-schemas';

const TODAY = new Date('2026-08-24T00:00:00Z');

describe('el contrato con TMDB, contra respuestas reales', () => {
  it('la configuración trae base segura y tamaños de póster', () => {
    const parsed = imageConfigurationSchema.parse(configuration);

    expect(parsed.images.secure_base_url).toBe('https://image.tmdb.org/t/p/');
    expect(parsed.images.poster_sizes).toContain('w342');
  });

  it('los géneros llegan traducidos al idioma pedido', () => {
    const parsed = genreListSchema.parse(genres);

    expect(parsed.genres.map((genre) => genre.name)).toContain('Crimen');
  });

  it.each([
    ['tendencias', trending],
    ['descubrimiento', discover],
    ['búsqueda', search],
    ['recomendadas', recommendations],
  ])('%s valida y se traduce a una página del dominio', (_name, payload) => {
    const page = toMoviePage(moviePageSchema.parse(payload));

    expect(page.results.length).toBeGreaterThan(0);
    expect(page.totalPages).toBeLessThanOrEqual(500);
    expect(page.results[0]?.title).toEqual(expect.any(String));
  });

  it('la ficha completa llega en UNA petición: elenco, tráiler y traducciones', () => {
    const detail = toMovieDetail(movieDetailSchema.parse(movieDetail), TODAY);

    expect(detail.title).toBe('El padrino');
    expect(detail.runtimeMinutes).toBe(175);
    expect(detail.budget).toEqual({ amountInMinorUnits: 600_000_000, currency: 'USD' });
    expect(detail.status).toEqual({ kind: 'released', releaseDate: '1972-03-14' });
    expect(detail.rating.kind).toBe('consolidated');
    expect(detail.cast.length).toBeGreaterThan(0);
    expect(detail.trailer?.site).toBe('YouTube');
    expect(detail.synopsis.kind).toBe('localized');
  });
});
