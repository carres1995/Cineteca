// src/presentation/components/Catalog/MovieDetail/Hero.tsx
import { Play } from 'lucide-react';
import type { MovieDetail } from '@/domain/catalog/movie-detail';
import { formatReleaseDate, formatRuntime } from '@/domain/format/date-format';
import { PosterImage } from '@/presentation/components/Common/PosterImage';
import { RatingBadge } from '@/presentation/components/Common/RatingBadge';
import { StatusBadge } from '@/presentation/components/Common/StatusBadge';
import { buttonVariants } from '@/presentation/components/Common/Button';
import { messages } from '@/presentation/i18n/messages';

/** La fecha visible depende del estado: cada rama muestra lo que de verdad tiene. */
function releaseLine(movie: MovieDetail): string {
  switch (movie.status.kind) {
    case 'released':
      return formatReleaseDate(movie.status.releaseDate);
    case 'upcoming':
      return movie.status.expectedDate === null
        ? messages.detail.noData
        : formatReleaseDate(movie.status.expectedDate);
    case 'canceled':
    case 'unknown':
      return messages.detail.noData;
  }
}

export function Hero({
  movie,
  posterUrl,
  children,
}: {
  movie: MovieDetail;
  posterUrl: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="w-full max-w-56 shrink-0">
        <PosterImage url={posterUrl} alt={`Póster de ${movie.title}`} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={movie.status} />
          <span className="text-ink-muted text-sm">{releaseLine(movie)}</span>
          {movie.runtimeMinutes !== null && (
            <span className="text-ink-muted text-sm">{formatRuntime(movie.runtimeMinutes)}</span>
          )}
        </div>

        {movie.tagline !== null && <p className="text-ink-muted italic">{movie.tagline}</p>}

        <RatingBadge rating={movie.rating} />

        {movie.genres.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <li
                key={genre.id}
                className="bg-surface-raised text-ink-muted rounded px-2 py-0.5 text-xs"
              >
                {genre.name}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {movie.trailer !== null && (
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailer.key}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'secondary' })}
            >
              <Play aria-hidden="true" className="size-4" />
              {messages.detail.trailer}
            </a>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
