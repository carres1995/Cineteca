// src/presentation/pages/MovieDetailPage.tsx
import { Link, useParams } from 'react-router';
import { summaryOf } from '@/domain/catalog/movie-detail';
import { Cast } from '@/presentation/components/Catalog/MovieDetail/Cast';
import { Hero } from '@/presentation/components/Catalog/MovieDetail/Hero';
import { Info } from '@/presentation/components/Catalog/MovieDetail/Info';
import { Recommendations } from '@/presentation/components/Catalog/MovieDetail/Recommendations';
import { buttonVariants } from '@/presentation/components/Common/Button';
import { ErrorState } from '@/presentation/components/Common/ErrorState';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { AddToListControl } from '@/presentation/components/Library/AddToListControl';
import { SaveMovieButton } from '@/presentation/components/Library/SaveMovieButton';
import { useMovieDetail, useRecommendations } from '@/presentation/hooks/use-catalog-queries';
import { useImageUrls } from '@/presentation/hooks/use-image-urls';
import { useLibrary, useToggleMovieInList } from '@/presentation/hooks/use-library';
import { errorMessage, messages } from '@/presentation/i18n/messages';

/** La ruta también es un borde: `/pelicula/abc` no puede romper la pantalla. */
export default function MovieDetailPage() {
  const { id } = useParams();
  const movieId = Number(id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return (
      <>
        <PageHeading title={messages.pages.notFoundTitle} />
        <p className="text-ink-muted mb-6">{messages.pages.notFoundBody}</p>
        <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
          {messages.pages.backHome}
        </Link>
      </>
    );
  }

  return <MovieDetailView id={movieId} />;
}

function MovieDetailView({ id }: { id: number }) {
  const detail = useMovieDetail(id);
  const recommendations = useRecommendations(id);
  const images = useImageUrls();
  const library = useLibrary();
  const toggleInList = useToggleMovieInList();

  if (detail.isError) {
    return (
      <>
        <PageHeading title={messages.pages.notFoundTitle} />
        <ErrorState
          message={errorMessage(detail.error)}
          onRetry={() => {
            void detail.refetch();
          }}
        />
      </>
    );
  }

  if (detail.isPending) {
    return (
      <>
        <PageHeading title={messages.states.loading} />
        <LoadingState count={5} />
      </>
    );
  }

  const movie = detail.data;
  const summary = summaryOf(movie);

  return (
    <div className="space-y-10">
      <PageHeading title={movie.title} />

      <Hero movie={movie} posterUrl={images.detailPoster(movie.posterPath)}>
        <SaveMovieButton movie={summary} />
      </Hero>

      {library.data !== undefined && (
        <AddToListControl
          library={library.data}
          movie={summary}
          isPending={toggleInList.isPending}
          onToggle={(listId) => {
            toggleInList.mutate({ listId, movie: summary });
          }}
        />
      )}

      <Info movie={movie} />

      <Cast cast={movie.cast} getProfileUrl={(member) => images.profile(member.profilePath)} />

      {/* Las recomendadas fallan aparte: que no haya sección no rompe la ficha. */}
      {recommendations.isSuccess && (
        <Recommendations
          movies={recommendations.data.results}
          getPosterUrl={(item) => images.gridPoster(item.posterPath)}
        />
      )}
    </div>
  );
}
