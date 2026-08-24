// src/presentation/components/Catalog/MovieDetail/Recommendations.tsx
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import { MovieGrid } from '@/presentation/components/Common/MovieGrid';
import { messages } from '@/presentation/i18n/messages';

/** Reusa la misma cuadrícula que Explorar: una tarjeta se ve igual en toda la app. */
export function Recommendations({
  movies,
  getPosterUrl,
}: {
  movies: readonly MovieSummary[];
  getPosterUrl: (movie: MovieSummary) => string | null;
}) {
  return (
    <section aria-labelledby="movie-recommendations" className="space-y-4">
      <h2 id="movie-recommendations" className="text-lg font-semibold">
        {messages.detail.recommendations}
      </h2>

      {movies.length === 0 ? (
        <p className="text-ink-muted">{messages.detail.noRecommendations}</p>
      ) : (
        <MovieGrid
          movies={movies}
          getPosterUrl={getPosterUrl}
          label={messages.detail.recommendations}
        />
      )}
    </section>
  );
}
