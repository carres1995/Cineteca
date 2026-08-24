// src/presentation/components/Catalog/DiscoverFilters.tsx
import type { DiscoverFilters as Filters, SortOption } from '@/domain/catalog/discover-filters';
import { EARLIEST_YEAR, SORT_OPTIONS, isDefaultFilters } from '@/domain/catalog/discover-filters';
import type { Genre } from '@/domain/catalog/movie-summary';
import { Button } from '@/presentation/components/Common/Button';
import { messages } from '@/presentation/i18n/messages';

const SCORES = [5, 6, 7, 8, 9] as const;
const VOTE_THRESHOLDS = [50, 100, 500, 1_000] as const;

const field =
  'bg-surface-raised text-ink min-h-touch focus-visible:outline-ink rounded border border-transparent px-3 focus-visible:outline-2 focus-visible:outline-offset-2';

function numberOrNull(value: string): number | null {
  return value === '' ? null : Number.parseInt(value, 10);
}

/**
 * Los controles solo leen `filters` y avisan del cambio: no tocan la URL ni la
 * caché. Quien los usa decide dónde vive ese estado —en este proyecto, la URL—.
 * Cambiar cualquier filtro vuelve a la página 1: pedir la página 7 de otra
 * consulta no significa nada.
 */
export function DiscoverFilters({
  filters,
  genres,
  onChange,
  onClear,
  currentYear,
}: {
  filters: Filters;
  genres: readonly Genre[];
  onChange: (filters: Filters) => void;
  onClear: () => void;
  currentYear: number;
}) {
  const update = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  return (
    <section aria-label={messages.filters.title} className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-genre" className="text-ink-muted text-sm">
          {messages.filters.genre}
        </label>
        <select
          id="filter-genre"
          className={field}
          value={filters.genreId ?? ''}
          onChange={(event) => {
            update({ genreId: numberOrNull(event.target.value) });
          }}
        >
          <option value="">{messages.filters.all}</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-year" className="text-ink-muted text-sm">
          {messages.filters.year}
        </label>
        <input
          id="filter-year"
          type="number"
          inputMode="numeric"
          min={EARLIEST_YEAR}
          max={currentYear + 1}
          className={`${field} w-32`}
          value={filters.year ?? ''}
          onChange={(event) => {
            update({ year: numberOrNull(event.target.value) });
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-score" className="text-ink-muted text-sm">
          {messages.filters.minimumScore}
        </label>
        <select
          id="filter-score"
          className={field}
          value={filters.minimumScore ?? ''}
          onChange={(event) => {
            update({ minimumScore: numberOrNull(event.target.value) });
          }}
        >
          <option value="">{messages.filters.any}</option>
          {SCORES.map((score) => (
            <option key={score} value={score}>
              {score}+
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-votes" className="text-ink-muted text-sm">
          {messages.filters.minimumVotes}
        </label>
        <select
          id="filter-votes"
          className={field}
          value={filters.minimumVotes ?? ''}
          onChange={(event) => {
            update({ minimumVotes: numberOrNull(event.target.value) });
          }}
        >
          <option value="">{messages.filters.any}</option>
          {VOTE_THRESHOLDS.map((votes) => (
            <option key={votes} value={votes}>
              {votes}+
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-sort" className="text-ink-muted text-sm">
          {messages.filters.sortBy}
        </label>
        <select
          id="filter-sort"
          className={field}
          value={filters.sortBy}
          onChange={(event) => {
            update({ sortBy: event.target.value as SortOption });
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {messages.filters.sort[option]}
            </option>
          ))}
        </select>
      </div>

      {!isDefaultFilters(filters) && (
        <Button variant="secondary" onClick={onClear}>
          {messages.filters.clear}
        </Button>
      )}
    </section>
  );
}
