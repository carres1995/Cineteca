// src/infrastructure/tmdb/tmdb-mappers.ts
import type { MovieDetail, Synopsis, Trailer } from '@/domain/catalog/movie-detail';
import type { MoviePage, MovieSummary } from '@/domain/catalog/movie-summary';
import { TMDB_MAX_PAGE } from '@/domain/catalog/movie-summary';
import { ratingFrom } from '@/domain/catalog/rating';
import { releaseStatusFrom } from '@/domain/catalog/release-status';
import { moneyFromTmdbAmount } from '@/domain/money/money';
import type { MovieDetailDto, MoviePageDto, MovieSummaryDto } from './tmdb-schemas';

/**
 * ESTA es la línea donde una cadena vacía de TMDB deja de fingir que es un dato.
 * A partir de aquí, `null` significa "no lo sé" y el tipo obliga a tratarlo.
 */
function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

export function toMovieSummary(dto: MovieSummaryDto): MovieSummary {
  return {
    id: dto.id,
    title: dto.title,
    posterPath: emptyToNull(dto.poster_path),
    releaseDate: emptyToNull(dto.release_date),
    overview: emptyToNull(dto.overview),
    // Y esta es la línea donde un 0 de votos deja de ser un 0,0 de nota.
    rating: ratingFrom(dto.vote_average, dto.vote_count),
  };
}

export function toMoviePage(dto: MoviePageDto): MoviePage {
  return {
    page: dto.page,
    results: dto.results.map(toMovieSummary),
    totalResults: dto.total_results,
    // El tope de 500 no es un detalle de la API: es una regla que la app respeta.
    totalPages: Math.min(dto.total_pages, TMDB_MAX_PAGE),
  };
}

/** Se prefiere el tráiler oficial de YouTube; lo demás no se sabe incrustar. */
function pickTrailer(videos: MovieDetailDto['videos']['results']): Trailer | null {
  const playable = videos.filter((video) => video.site === 'YouTube' && video.type === 'Trailer');
  const chosen = playable.find((video) => video.official === true) ?? playable[0];

  return chosen === undefined ? null : { key: chosen.key, name: chosen.name, site: 'YouTube' };
}

/**
 * Sinopsis: si TMDB no la tiene en el idioma pedido, se ofrece la que sí existe
 * y se dice en cuál está. Un hueco disfrazado de dato sería peor que el hueco.
 */
function pickSynopsis(dto: MovieDetailDto, fallbackLanguage: string): Synopsis {
  const localized = emptyToNull(dto.overview);
  if (localized !== null) return { kind: 'localized', text: localized };

  const translation = dto.translations.translations.find(
    (candidate) => candidate.iso_639_1 === fallbackLanguage,
  );
  const text = emptyToNull(translation?.data.overview);

  return text === null
    ? { kind: 'none' }
    : { kind: 'fallback', text, language: translation?.english_name ?? fallbackLanguage };
}

export function toMovieDetail(
  dto: MovieDetailDto,
  today: Date,
  fallbackLanguage = 'en',
): MovieDetail {
  const releaseDate = emptyToNull(dto.release_date);

  return {
    id: dto.id,
    title: dto.title,
    originalTitle: dto.original_title,
    tagline: emptyToNull(dto.tagline),
    posterPath: emptyToNull(dto.poster_path),
    backdropPath: emptyToNull(dto.backdrop_path),
    synopsis: pickSynopsis(dto, fallbackLanguage),
    // Una duración de 0 minutos no es una película: es un dato que falta.
    runtimeMinutes: dto.runtime != null && dto.runtime > 0 ? dto.runtime : null,
    budget: moneyFromTmdbAmount(dto.budget),
    revenue: moneyFromTmdbAmount(dto.revenue),
    genres: dto.genres,
    status: releaseStatusFrom(dto.status, releaseDate, today),
    rating: ratingFrom(dto.vote_average, dto.vote_count),
    cast: dto.credits.cast.map((member) => ({
      id: member.id,
      name: member.name,
      character: emptyToNull(member.character),
      profilePath: emptyToNull(member.profile_path),
    })),
    trailer: pickTrailer(dto.videos.results),
  };
}
