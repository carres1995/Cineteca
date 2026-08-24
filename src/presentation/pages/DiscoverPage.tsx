// src/presentation/pages/DiscoverPage.tsx
import { useSearchParams } from 'react-router';
import type { DiscoverFilters as Filters } from '@/domain/catalog/discover-filters';
import { DEFAULT_FILTERS, isDefaultFilters } from '@/domain/catalog/discover-filters';
import { parseDiscoverFilters, toSearchParams } from '@/domain/catalog/discover-filters-url';
import { DiscoverFilters } from '@/presentation/components/Catalog/DiscoverFilters';
import { PaginationControl } from '@/presentation/components/Catalog/PaginationControl';
import { Button } from '@/presentation/components/Common/Button';
import { EmptyState } from '@/presentation/components/Common/EmptyState';
import { ErrorState } from '@/presentation/components/Common/ErrorState';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { MovieGrid } from '@/presentation/components/Common/MovieGrid';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { useDiscoverMovies, useMovieGenres } from '@/presentation/hooks/use-catalog-queries';
import { useImageUrls } from '@/presentation/hooks/use-image-urls';
import { errorMessage, messages } from '@/presentation/i18n/messages';

/**
 * Los filtros viven en la URL, no en el estado del componente: recargar
 * mantiene la vista y compartir el enlace la reproduce exacta en otro navegador.
 * Y como la URL es un borde no confiable, se valida al leerla.
 */
export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentYear = new Date().getFullYear();
  const filters = parseDiscoverFilters(searchParams, currentYear);

  const genres = useMovieGenres();
  const results = useDiscoverMovies(filters);
  const images = useImageUrls();

  const applyFilters = (next: Filters) => {
    setSearchParams(toSearchParams(next));
  };

  const clearFilters = () => {
    setSearchParams(toSearchParams(DEFAULT_FILTERS));
  };

  const movies = results.data?.pages.flatMap((page) => page.results) ?? [];
  const lastPage = results.data?.pages.at(-1);

  return (
    <>
      <PageHeading title={messages.pages.discoverTitle} />

      <div className="mb-8">
        <DiscoverFilters
          filters={filters}
          genres={genres.data ?? []}
          onChange={applyFilters}
          onClear={clearFilters}
          currentYear={currentYear}
        />
      </div>

      {results.isError ? (
        <ErrorState
          message={errorMessage(results.error)}
          onRetry={() => {
            void results.refetch();
          }}
        />
      ) : results.isPending ? (
        <LoadingState />
      ) : movies.length === 0 ? (
        // El vacío por filtro no es un caso raro: es lo que ve la mitad de la
        // gente que filtra demasiado. Por eso trae la salida puesta.
        <EmptyState
          title={messages.states.emptyByFilter}
          description={
            isDefaultFilters(filters)
              ? messages.states.emptyTrending
              : messages.states.emptyByFilterAction
          }
          action={
            isDefaultFilters(filters) ? undefined : (
              <Button variant="secondary" onClick={clearFilters}>
                {messages.filters.clear}
              </Button>
            )
          }
        />
      ) : (
        <>
          <MovieGrid
            movies={movies}
            getPosterUrl={(movie) => images.gridPoster(movie.posterPath)}
            label={messages.pages.discoverTitle}
          />
          <PaginationControl
            page={lastPage?.page ?? filters.page}
            totalPages={lastPage?.totalPages ?? filters.page}
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
