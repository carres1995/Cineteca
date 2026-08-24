// src/presentation/pages/SearchPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FILTER_PARAMS } from '@/domain/catalog/discover-filters-url';
import { PaginationControl } from '@/presentation/components/Catalog/PaginationControl';
import { EmptyState } from '@/presentation/components/Common/EmptyState';
import { ErrorState } from '@/presentation/components/Common/ErrorState';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { MovieGrid } from '@/presentation/components/Common/MovieGrid';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { SearchInput } from '@/presentation/components/Search/SearchInput';
import { useSearchMovies } from '@/presentation/hooks/use-catalog-queries';
import { useDebouncedValue } from '@/presentation/hooks/use-debounced-value';
import { useImageUrls } from '@/presentation/hooks/use-image-urls';
import { errorMessage, messages } from '@/presentation/i18n/messages';

const DEBOUNCE_MS = 400;

/**
 * El texto se escribe en cada tecla, pero la consulta espera: diez letras
 * disparan UNA petición. La búsqueda también vive en la URL, así que el enlace
 * de un resultado se puede compartir.
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [text, setText] = useState(() => searchParams.get(FILTER_PARAMS.query) ?? '');
  const debounced = useDebouncedValue(text, DEBOUNCE_MS);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced.trim() !== '') params.set(FILTER_PARAMS.query, debounced.trim());
    // `replace`: escribir no debería llenar el historial de vueltas atrás.
    setSearchParams(params, { replace: true });
  }, [debounced, setSearchParams]);

  const results = useSearchMovies(debounced);
  const images = useImageUrls();

  const movies = results.data?.pages.flatMap((page) => page.results) ?? [];
  const lastPage = results.data?.pages.at(-1);
  const hasQuery = debounced.trim() !== '';

  return (
    <>
      <PageHeading title={messages.pages.searchTitle} />

      <div className="mb-8 max-w-lg">
        <SearchInput value={text} onChange={setText} />
      </div>

      {!hasQuery ? (
        <EmptyState title={messages.pages.searchTitle} description={messages.search.idle} />
      ) : results.isError ? (
        <ErrorState
          message={errorMessage(results.error)}
          onRetry={() => {
            void results.refetch();
          }}
        />
      ) : results.isPending || results.isFetching ? (
        <LoadingState />
      ) : movies.length === 0 ? (
        <EmptyState
          title={messages.search.noResults(debounced.trim())}
          description={messages.states.emptyByFilterAction}
        />
      ) : (
        <>
          <p className="text-ink-muted mb-4 text-sm" role="status">
            {messages.search.resultCount(lastPage?.totalResults ?? movies.length)}
          </p>
          <MovieGrid
            movies={movies}
            getPosterUrl={(movie) => images.gridPoster(movie.posterPath)}
            label={messages.pages.searchTitle}
          />
          <PaginationControl
            page={lastPage?.page ?? 1}
            totalPages={lastPage?.totalPages ?? 1}
            isLoadingMore={results.isFetchingNextPage}
            onLoadMore={() => {
              void results.fetchNextPage();
            }}
          />
        </>
      )}
    </>
  );
}
