// src/presentation/components/Catalog/PaginationControl.tsx
import { TMDB_MAX_PAGE } from '@/domain/catalog/movie-summary';
import { Button } from '@/presentation/components/Common/Button';
import { messages } from '@/presentation/i18n/messages';

/**
 * La paginación se detiene CON UN MENSAJE al llegar al tope de la API: quedarse
 * en silencio parece un fallo, y seguir pidiendo es gastar red para nada.
 */
export function PaginationControl({
  page,
  totalPages,
  isLoadingMore,
  onLoadMore,
}: {
  page: number;
  totalPages: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (page >= totalPages) {
    return (
      <p role="status" className="text-ink-muted py-4 text-sm">
        {totalPages >= TMDB_MAX_PAGE ? messages.pagination.apiLimit : messages.pagination.end}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <Button onClick={onLoadMore} disabled={isLoadingMore}>
        {isLoadingMore ? messages.pagination.loading : messages.pagination.loadMore}
      </Button>
      <p role="status" className="text-ink-muted text-sm">
        {messages.pagination.pageOf(page, totalPages)}
      </p>
    </div>
  );
}
