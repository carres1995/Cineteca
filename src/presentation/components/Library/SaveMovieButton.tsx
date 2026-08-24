// src/presentation/components/Library/SaveMovieButton.tsx
import { Heart } from 'lucide-react';
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import { isSaved } from '@/domain/library/library';
import { useLibrary, useToggleSaved } from '@/presentation/hooks/use-library';
import { messages } from '@/presentation/i18n/messages';
import { cn } from '@/presentation/lib/cn';

/**
 * El corazón responde antes que el disco: la mutación es optimista y vuelve
 * sola a su sitio si la escritura falla. El estado NO se comunica solo con el
 * color: el nombre accesible del botón dice si guarda o quita.
 */
export function SaveMovieButton({ movie, className }: { movie: MovieSummary; className?: string }) {
  const library = useLibrary();
  const toggle = useToggleSaved();

  const saved = library.data !== undefined && isSaved(library.data, movie.id);
  const label = saved ? messages.library.remove(movie.title) : messages.library.save(movie.title);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={library.isPending}
      onClick={() => {
        toggle.mutate(movie);
      }}
      className={cn(
        'bg-surface/80 text-ink min-h-touch focus-visible:outline-ink inline-flex items-center justify-center rounded px-3 backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
        className,
      )}
    >
      <Heart aria-hidden="true" className={cn('size-5', saved && 'fill-brand text-brand')} />
    </button>
  );
}
