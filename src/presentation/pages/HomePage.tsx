// src/presentation/pages/HomePage.tsx
import { Link } from 'react-router';
import { buttonVariants } from '@/presentation/components/Common/Button';
import { EmptyState } from '@/presentation/components/Common/EmptyState';
import { ErrorState } from '@/presentation/components/Common/ErrorState';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { MovieGrid } from '@/presentation/components/Common/MovieGrid';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { useTrendingMovies } from '@/presentation/hooks/use-catalog-queries';
import { useImageUrls } from '@/presentation/hooks/use-image-urls';
import { errorMessage, messages } from '@/presentation/i18n/messages';

export default function HomePage() {
  const trending = useTrendingMovies();
  const images = useImageUrls();

  return (
    <>
      <PageHeading title={messages.pages.homeTitle} subtitle={messages.tagline} />

      <p className="mb-6">
        <Link to="/explorar" className={buttonVariants({ variant: 'secondary' })}>
          {messages.nav.discover}
        </Link>
      </p>

      {trending.isError ? (
        <ErrorState
          message={errorMessage(trending.error)}
          onRetry={() => {
            void trending.refetch();
          }}
        />
      ) : trending.isPending ? (
        <LoadingState />
      ) : trending.data.results.length === 0 ? (
        <EmptyState
          title={messages.pages.homeTitle}
          description={messages.states.emptyTrending}
          action={
            <Link to="/explorar" className={buttonVariants({ variant: 'secondary' })}>
              {messages.nav.discover}
            </Link>
          }
        />
      ) : (
        <MovieGrid
          movies={trending.data.results}
          getPosterUrl={(movie) => images.gridPoster(movie.posterPath)}
          label={messages.pages.homeTitle}
        />
      )}
    </>
  );
}
