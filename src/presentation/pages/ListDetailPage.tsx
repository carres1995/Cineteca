// src/presentation/pages/ListDetailPage.tsx
import { Link, useParams } from 'react-router';
import { findList, moviesOfList } from '@/domain/library/library';
import { buttonVariants } from '@/presentation/components/Common/Button';
import { EmptyState } from '@/presentation/components/Common/EmptyState';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { MovieGrid } from '@/presentation/components/Common/MovieGrid';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { ListForm } from '@/presentation/components/Library/ListForm';
import { useImageUrls } from '@/presentation/hooks/use-image-urls';
import { useLibrary, useRenameList } from '@/presentation/hooks/use-library';
import { messages } from '@/presentation/i18n/messages';

export default function ListDetailPage() {
  const { id = '' } = useParams();
  const library = useLibrary();
  const renameList = useRenameList();
  const images = useImageUrls();

  if (library.isPending) {
    return (
      <>
        <PageHeading title={messages.lists.title} />
        <LoadingState count={5} />
      </>
    );
  }

  const list = library.data === undefined ? null : findList(library.data, id);

  // Un identificador inventado en la URL no rompe nada: es un vacío con salida.
  if (list === null || library.data === undefined) {
    return (
      <>
        <PageHeading title={messages.lists.notFoundTitle} subtitle={messages.lists.notFoundBody} />
        <Link to="/cineteca" className={buttonVariants({ variant: 'secondary' })}>
          {messages.library.title}
        </Link>
      </>
    );
  }

  const movies = moviesOfList(library.data, list);

  return (
    <div className="space-y-8">
      <PageHeading title={list.name} subtitle={messages.library.count(movies.length)} />

      <ListForm
        library={library.data}
        listId={list.id}
        defaultName={list.name}
        submitLabel={messages.lists.rename}
        pendingLabel={messages.lists.creating}
        isPending={renameList.isPending}
        onSubmit={({ name }) => {
          renameList.mutate({ id: list.id, name });
        }}
      />

      {movies.length === 0 ? (
        <EmptyState
          title={messages.lists.emptyList}
          description={messages.lists.addFrom}
          action={
            <Link to="/cineteca" className={buttonVariants({ variant: 'secondary' })}>
              {messages.library.title}
            </Link>
          }
        />
      ) : (
        <MovieGrid
          movies={movies}
          getPosterUrl={(movie) => images.gridPoster(movie.posterPath)}
          label={list.name}
        />
      )}
    </div>
  );
}
