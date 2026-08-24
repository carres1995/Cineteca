// src/presentation/components/Library/ListManager.tsx
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import type { Library } from '@/domain/library/library';
import { Button } from '@/presentation/components/Common/Button';
import { messages } from '@/presentation/i18n/messages';
import { ListForm } from './ListForm';

/**
 * Crear y borrar listas. El identificador entra por props: `crypto.randomUUID`
 * dentro del componente haría imposible una prueba determinista.
 */
export function ListManager({
  library,
  isPending,
  onCreate,
  onDelete,
  createId,
}: {
  library: Library;
  isPending: boolean;
  onCreate: (input: { id: string; name: string }) => void;
  onDelete: (listId: string) => void;
  createId: () => string;
}) {
  return (
    <section aria-labelledby="lists-title" className="space-y-4">
      <h2 id="lists-title" className="text-lg font-semibold">
        {messages.lists.title}
      </h2>

      <ListForm
        library={library}
        submitLabel={messages.lists.create}
        pendingLabel={messages.lists.creating}
        isPending={isPending}
        onSubmit={({ name }) => {
          onCreate({ id: createId(), name });
        }}
      />

      {library.lists.length === 0 ? (
        <p className="text-ink-muted">{messages.lists.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {library.lists.map((list) => (
            <li
              key={list.id}
              className="bg-surface-raised rounded-card flex items-center justify-between gap-4 p-4"
            >
              <div>
                <Link
                  to={`/cineteca/listas/${list.id}`}
                  className="focus-visible:outline-ink rounded font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {list.name}
                </Link>
                <p className="text-ink-muted text-sm">
                  {messages.library.count(list.movieIds.length)}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                aria-label={messages.lists.deleteConfirm(list.name)}
                onClick={() => {
                  onDelete(list.id);
                }}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
