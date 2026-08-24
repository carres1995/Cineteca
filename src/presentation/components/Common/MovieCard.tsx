// src/presentation/components/Common/MovieCard.tsx
import { Link } from 'react-router';
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import { releaseYear } from '@/domain/format/number-format';
import { SaveMovieButton } from '@/presentation/components/Library/SaveMovieButton';
import { messages } from '@/presentation/i18n/messages';
import { PosterImage } from './PosterImage';
import { RatingBadge } from './RatingBadge';

/**
 * UN solo enlace por tarjeta, con el nombre accesible completo: "El padrino,
 * 1972, 8,7 de 10". Tres niveles de jerarquía: título, metadatos atenuados y la
 * valoración en su propio nivel tipográfico.
 *
 * Recibe la URL del póster por props: una tarjeta no consulta la red.
 */
export function MovieCard({ movie, posterUrl }: { movie: MovieSummary; posterUrl: string | null }) {
  const year = releaseYear(movie.releaseDate);

  return (
    <article className="relative">
      {/* Fuera del enlace a propósito: la tarjeta sigue siendo UN enlace. */}
      <SaveMovieButton movie={movie} className="absolute top-2 right-2 z-10" />

      <Link
        to={`/pelicula/${String(movie.id)}`}
        aria-label={messages.card.accessibleName(movie.title, year, movie.rating)}
        className="focus-visible:outline-ink group block rounded focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <PosterImage url={posterUrl} className="mb-2 transition-opacity group-hover:opacity-90" />
        <h3 className="text-ink font-semibold" aria-hidden="true">
          {movie.title}
        </h3>
        <p className="text-ink-muted text-sm" aria-hidden="true">
          {year ?? messages.states.noYear}
        </p>
        <div aria-hidden="true">
          <RatingBadge rating={movie.rating} />
        </div>
      </Link>
    </article>
  );
}
