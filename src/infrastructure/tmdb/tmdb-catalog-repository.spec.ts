// src/infrastructure/tmdb/tmdb-catalog-repository.spec.ts
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/domain/errors/api-error';
import { server } from '@/test/msw/server';
import { createTmdbCatalogRepository } from './tmdb-catalog-repository';

const TMDB = 'https://api.themoviedb.org/3';
const catalog = createTmdbCatalogRepository();

function movieDto(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: 'El padrino',
    poster_path: '/poster.jpg',
    release_date: '1972-03-14',
    overview: 'Una familia.',
    vote_average: 8.7,
    vote_count: 20_000,
    ...overrides,
  };
}

function pageDto(results: unknown[], overrides: Record<string, unknown> = {}) {
  return { page: 1, results, total_pages: 3, total_results: 60, ...overrides };
}

describe('el borde de red', () => {
  it('manda la credencial y el idioma del contenido en cada petición', async () => {
    let seen: Request | undefined;
    server.use(
      http.get(`${TMDB}/trending/movie/week`, ({ request }) => {
        seen = request;
        return HttpResponse.json(pageDto([movieDto()]));
      }),
    );

    await catalog.getTrendingMoviesOfWeek(1);

    expect(seen?.headers.get('authorization')).toBe(
      'Bearer test-read-access-token-0123456789abcdefgh',
    );
    expect(new URL(seen?.url ?? '').searchParams.get('language')).toBe('es-ES');
  });

  it('traduce las ausencias de TMDB a null y a "sin valoraciones"', async () => {
    server.use(
      http.get(`${TMDB}/trending/movie/week`, () =>
        HttpResponse.json(
          pageDto([
            movieDto({
              poster_path: null,
              release_date: '',
              overview: '   ',
              vote_average: 0,
              vote_count: 0,
            }),
          ]),
        ),
      ),
    );

    const page = await catalog.getTrendingMoviesOfWeek(1);

    expect(page.results[0]).toMatchObject({
      posterPath: null,
      releaseDate: null,
      overview: null,
      rating: { kind: 'unrated' },
    });
  });

  it('distingue una nota provisional de una consolidada', async () => {
    server.use(
      http.get(`${TMDB}/trending/movie/week`, () =>
        HttpResponse.json(
          pageDto([
            movieDto({ id: 1, vote_count: 4, vote_average: 9 }),
            movieDto({ id: 2, vote_count: 20_000, vote_average: 8.7 }),
          ]),
        ),
      ),
    );

    const page = await catalog.getTrendingMoviesOfWeek(1);

    expect(page.results[0]?.rating.kind).toBe('provisional');
    expect(page.results[1]?.rating.kind).toBe('consolidated');
  });

  it('recorta el total de páginas al tope duro de la API', async () => {
    server.use(
      http.get(`${TMDB}/trending/movie/week`, () =>
        HttpResponse.json(pageDto([movieDto()], { total_pages: 900 })),
      ),
    );

    await expect(catalog.getTrendingMoviesOfWeek(1)).resolves.toMatchObject({ totalPages: 500 });
  });

  it('no gasta una petición pidiendo más allá del tope', async () => {
    let seen: Request | undefined;
    server.use(
      http.get(`${TMDB}/trending/movie/week`, ({ request }) => {
        seen = request;
        return HttpResponse.json(pageDto([movieDto()]));
      }),
    );

    await catalog.getTrendingMoviesOfWeek(9_999);

    expect(new URL(seen?.url ?? '').searchParams.get('page')).toBe('500');
  });

  it('convierte una respuesta que rompe el contrato en un error localizado', async () => {
    server.use(
      http.get(`${TMDB}/trending/movie/week`, () =>
        HttpResponse.json(pageDto([movieDto({ vote_average: 'ocho' })])),
      ),
    );

    const error = await catalog.getTrendingMoviesOfWeek(1).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).detail.kind).toBe('invalidResponse');
  });

  it('traduce el código 34 de TMDB a "no encontrado"', async () => {
    server.use(
      http.get(`${TMDB}/trending/movie/week`, () =>
        HttpResponse.json(
          { status_code: 34, status_message: 'The resource you requested could not be found.' },
          { status: 404 },
        ),
      ),
    );

    const error = await catalog.getTrendingMoviesOfWeek(1).catch((caught: unknown) => caught);

    expect((error as ApiError).detail).toEqual({ kind: 'notFound' });
  });

  it('respeta la espera que indica el servidor ante un límite de tasa', async () => {
    server.use(
      http.get(`${TMDB}/trending/movie/week`, () =>
        HttpResponse.json({}, { status: 429, headers: { 'retry-after': '3' } }),
      ),
    );

    const error = await catalog.getTrendingMoviesOfWeek(1).catch((caught: unknown) => caught);

    expect((error as ApiError).detail).toEqual({ kind: 'rateLimited', retryAfterMs: 3_000 });
  });

  it('traduce una credencial inválida sin exponer el error crudo', async () => {
    server.use(
      http.get(`${TMDB}/configuration`, () =>
        HttpResponse.json({ status_code: 7, status_message: 'Invalid API key' }, { status: 401 }),
      ),
    );

    const error = await catalog.getImageConfiguration().catch((caught: unknown) => caught);

    expect((error as ApiError).detail).toEqual({ kind: 'unauthorized' });
  });

  it('lee la configuración de imágenes y los géneros', async () => {
    server.use(
      http.get(`${TMDB}/configuration`, () =>
        HttpResponse.json({
          images: {
            secure_base_url: 'https://image.tmdb.org/t/p/',
            poster_sizes: ['w92', 'w342', 'original'],
            backdrop_sizes: ['w300', 'original'],
            profile_sizes: ['w185', 'original'],
          },
        }),
      ),
      http.get(`${TMDB}/genre/movie/list`, () =>
        HttpResponse.json({ genres: [{ id: 28, name: 'Acción' }] }),
      ),
    );

    await expect(catalog.getImageConfiguration()).resolves.toMatchObject({
      secureBaseUrl: 'https://image.tmdb.org/t/p/',
    });
    await expect(catalog.getMovieGenres()).resolves.toEqual([{ id: 28, name: 'Acción' }]);
  });
});

describe('los otros endpoints del catálogo', () => {
  it('descubrimiento traduce los filtros del dominio a los nombres de TMDB', async () => {
    let seen: URL | undefined;
    server.use(
      http.get(`${TMDB}/discover/movie`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json(pageDto([movieDto()]));
      }),
    );

    await catalog.discoverMovies({
      genreId: 28,
      year: 1999,
      minimumScore: 7,
      minimumVotes: 500,
      sortBy: 'revenue.desc',
      page: 2,
    });

    expect(Object.fromEntries(seen?.searchParams ?? [])).toMatchObject({
      with_genres: '28',
      primary_release_year: '1999',
      'vote_average.gte': '7',
      'vote_count.gte': '500',
      sort_by: 'revenue.desc',
      page: '2',
      include_adult: 'false',
    });
  });

  it('descubrimiento sin filtros no manda parámetros vacíos', async () => {
    let seen: URL | undefined;
    server.use(
      http.get(`${TMDB}/discover/movie`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json(pageDto([movieDto()]));
      }),
    );

    await catalog.discoverMovies({
      genreId: null,
      year: null,
      minimumScore: null,
      minimumVotes: null,
      sortBy: 'popularity.desc',
      page: 1,
    });

    expect(seen?.searchParams.has('with_genres')).toBe(false);
    expect(seen?.searchParams.has('vote_count.gte')).toBe(false);
  });

  it('la búsqueda manda el texto sin espacios de sobra', async () => {
    let seen: URL | undefined;
    server.use(
      http.get(`${TMDB}/search/movie`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json(pageDto([movieDto()]));
      }),
    );

    await catalog.searchMovies('  el padrino  ', 1);

    expect(seen?.searchParams.get('query')).toBe('el padrino');
  });

  it('la ficha pide elenco, vídeos y traducciones en la MISMA petición', async () => {
    let seen: URL | undefined;
    server.use(
      http.get(`${TMDB}/movie/238`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json({
          id: 238,
          title: 'El padrino',
          original_title: 'The Godfather',
          tagline: '',
          overview: '',
          poster_path: null,
          backdrop_path: null,
          release_date: '1972-03-14',
          runtime: 0,
          budget: 0,
          revenue: 0,
          status: 'Released',
          vote_average: 8.7,
          vote_count: 20000,
          genres: [],
          credits: { cast: [{ id: 1, name: 'Marlon Brando', character: '', profile_path: null }] },
          videos: { results: [{ key: 'x', name: 'Teaser', site: 'Vimeo', type: 'Trailer' }] },
          translations: {
            translations: [
              { iso_639_1: 'en', english_name: 'English', data: { overview: 'A family.' } },
            ],
          },
        });
      }),
    );

    const movie = await catalog.getMovieDetail(238);

    expect(seen?.searchParams.get('append_to_response')).toBe('credits,videos,translations');
    // Y las ausencias siguen siendo ausencias: 0 no es duración ni presupuesto.
    expect(movie.runtimeMinutes).toBeNull();
    expect(movie.budget).toBeNull();
    expect(movie.tagline).toBeNull();
    expect(movie.cast[0]?.character).toBeNull();
    // Un vídeo que no sabemos incrustar no es un tráiler.
    expect(movie.trailer).toBeNull();
    // Sin sinopsis en español, se ofrece la que sí existe y se dice en cuál.
    expect(movie.synopsis).toEqual({ kind: 'fallback', text: 'A family.', language: 'English' });
  });

  it('las recomendadas también respetan el tope de páginas', async () => {
    let seen: URL | undefined;
    server.use(
      http.get(`${TMDB}/movie/238/recommendations`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json(pageDto([movieDto()]));
      }),
    );

    await catalog.getRecommendations(238, 900);

    expect(seen?.searchParams.get('page')).toBe('500');
  });
});
