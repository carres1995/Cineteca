// src/presentation/components/Library/AddToListControl.tsx
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import type { Library } from '@/domain/library/library';
import { Button } from '@/presentation/components/Common/Button';
import { messages } from '@/presentation/i18n/messages';

/**
 * Cada lista es un interruptor con su propio nombre accesible y su `aria-pressed`:
 * el estado no se comunica solo con el color de fondo.
 */
export function AddToListControl({
  library,
  movie,
  onToggle,
  isPending,
}: {
  library: Library;
  movie: MovieSummary;
  onToggle: (listId: string) => void;
  isPending: boolean;
}) {
  if (library.lists.length === 0) return null;

  return (
    <section aria-labelledby="add-to-list" className="space-y-2">
      <h2 id="add-to-list" className="text-ink-muted text-sm">
        {messages.lists.title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {library.lists.map((list) => {
          const included = list.movieIds.includes(movie.id);

          return (
            <li key={list.id}>
              <Button
                variant={included ? 'primary' : 'secondary'}
                size="sm"
                aria-pressed={included}
                aria-label={
                  included
                    ? messages.lists.removeFromList(list.name)
                    : messages.lists.addToList(list.name)
                }
                disabled={isPending}
                onClick={() => {
                  onToggle(list.id);
                }}
              >
                {list.name}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
