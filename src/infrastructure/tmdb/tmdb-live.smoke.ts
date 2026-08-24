// src/infrastructure/tmdb/tmdb-live.smoke.ts
import { describe, expect, it } from 'vitest';
import { credential, envError } from '@/infrastructure/config/env';
import { createTmdbCatalogRepository } from './tmdb-catalog-repository';

/**
 * Esto NO es una prueba unitaria: sale a la red de verdad con la credencial de
 * verdad y recorre exactamente el mismo camino que la app (cliente HTTP →
 * validación → dominio). Sirve para responder una sola pregunta: ¿estamos
 * consumiendo bien la API hoy?
 */
const catalog = createTmdbCatalogRepository();

describe('conexión real con TMDB', () => {
  it('la credencial del .env es válida y reconocida', () => {
    expect(envError).toBeNull();
    expect(['apiKey', 'readAccessToken']).toContain(credential.kind);
  });

  it('/configuration responde y valida', async () => {
    const configuration = await catalog.getImageConfiguration();

    expect(configuration.secureBaseUrl).toMatch(/^https:\/\//);
    expect(configuration.posterSizes.length).toBeGreaterThan(0);
  });

  it('/genre/movie/list responde en español', async () => {
    const genres = await catalog.getMovieGenres();

    expect(genres.length).toBeGreaterThan(0);
    expect(genres.map((genre) => genre.name)).toContain('Crimen');
  });

  it('/trending/movie/week trae una página válida y con tope respetado', async () => {
    const page = await catalog.getTrendingMoviesOfWeek(1);

    expect(page.results.length).toBeGreaterThan(0);
    expect(page.totalPages).toBeLessThanOrEqual(500);
  });

  it('/discover/movie respeta los filtros que le mandamos', async () => {
    const page = await catalog.discoverMovies({
      genreId: 28,
      year: null,
      minimumScore: null,
      minimumVotes: 100,
      sortBy: 'popularity.desc',
      page: 1,
    });

    expect(page.results.length).toBeGreaterThan(0);
  });

  it('/search/movie encuentra por texto', async () => {
    const page = await catalog.searchMovies('padrino', 1);

    expect(page.results.length).toBeGreaterThan(0);
  });

  it('/movie/{id} trae ficha, elenco y tráiler en UNA petición', async () => {
    const movie = await catalog.getMovieDetail(238);

    expect(movie.title).toBe('El padrino');
    expect(movie.cast.length).toBeGreaterThan(0);
    expect(movie.budget).not.toBeNull();
  });

  it('un id inexistente se traduce a "no encontrado", no a un error crudo', async () => {
    await expect(catalog.getMovieDetail(999_999_999)).rejects.toMatchObject({
      detail: { kind: 'notFound' },
    });
  });
});
