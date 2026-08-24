// src/presentation/pages/LibraryPage.tsx
import { Link } from 'react-router';
import { buttonVariants } from '@/presentation/components/Common/Button';
import { EmptyState } from '@/presentation/components/Common/EmptyState';
import { ErrorState } from '@/presentation/components/Common/ErrorState';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { MovieGrid } from '@/presentation/components/Common/MovieGrid';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { ListManager } from '@/presentation/components/Library/ListManager';
import { useImageUrls } from '@/presentation/hooks/use-image-urls';
import { useCreateList, useDeleteList, useLibrary } from '@/presentation/hooks/use-library';
import { errorMessage, messages } from '@/presentation/i18n/messages';

/** El identificador de una lista nueva: lo da el navegador, no el dominio. */
const newListId = () => globalThis.crypto.randomUUID();

export default function LibraryPage() {
  const library = useLibrary();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  const images = useImageUrls();

  if (library.isError) {
    return (
      <>
        <PageHeading title={messages.library.title} />
        <ErrorState
          message={errorMessage(library.error)}
          onRetry={() => {
            void library.refetch();
          }}
        />
      </>
    );
  }

  if (library.isPending) {
    return (
      <>
        <PageHeading title={messages.library.title} />
        <LoadingState count={5} />
      </>
    );
  }

  const movies = library.data.entries.map((entry) => entry.movie);

  return (
    <div className="space-y-10">
      <PageHeading title={messages.library.title} />

      <section aria-labelledby="saved-title" className="space-y-4">
        <h2 id="saved-title" className="text-lg font-semibold">
          {messages.library.saved}
        </h2>

        {movies.length === 0 ? (
          // Un vacío sin salida es un callejón: por eso lleva a explorar.
          <EmptyState
            title={messages.library.emptyTitle}
            description={messages.library.emptyBody}
            action={
              <Link to="/explorar" className={buttonVariants({ variant: 'secondary' })}>
                {messages.nav.discover}
              </Link>
            }
          />
        ) : (
          <MovieGrid
            movies={movies}
            getPosterUrl={(movie) => images.gridPoster(movie.posterPath)}
            label={messages.library.saved}
          />
        )}
      </section>

      <ListManager
        library={library.data}
        isPending={createList.isPending || deleteList.isPending}
        createId={newListId}
        onCreate={(input) => {
          createList.mutate(input);
        }}
        onDelete={(listId) => {
          deleteList.mutate(listId);
        }}
      />
    </div>
  );
}
