// src/presentation/components/Library/ListForm.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Library } from '@/domain/library/library';
import { validateListName } from '@/domain/library/library';
import { Button } from '@/presentation/components/Common/Button';
import { messages } from '@/presentation/i18n/messages';

/**
 * UN solo schema valida y tipa. Y la regla de qué nombre vale vive en el
 * dominio (`validateListName`): acá solo se traduce el motivo a un mensaje, así
 * que la regla no está decidida en dos sitios.
 */
function listFormSchema(library: Library, ignoreListId: string | null) {
  return z.object({
    name: z.string().superRefine((name, ctx) => {
      const problem = validateListName(library, name, ignoreListId);

      if (problem !== null) {
        ctx.addIssue({ code: 'custom', message: messages.lists.problems[problem] });
      }
    }),
  });
}

export type ListFormValues = z.infer<ReturnType<typeof listFormSchema>>;

export function ListForm({
  library,
  listId = null,
  defaultName = '',
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
}: {
  library: Library;
  listId?: string | null;
  defaultName?: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (values: ListFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema(library, listId)),
    defaultValues: { name: defaultName },
  });

  const error = errors.name;
  // El envío se bloquea mientras vuela: dos clics no crean dos listas.
  const blocked = isPending || isSubmitting;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit((values) => {
          onSubmit(values);
          reset({ name: listId === null ? '' : values.name });
        })(event);
      }}
      className="flex flex-wrap items-start gap-3"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={`list-name-${listId ?? 'new'}`} className="text-ink-muted text-sm">
          {messages.lists.name}
        </label>
        <input
          id={`list-name-${listId ?? 'new'}`}
          type="text"
          {...register('name')}
          aria-invalid={error !== undefined}
          aria-describedby={error === undefined ? undefined : `list-name-error-${listId ?? 'new'}`}
          className="bg-surface-raised text-ink min-h-touch focus-visible:outline-ink aria-[invalid=true]:border-danger w-64 rounded border border-transparent px-3 focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        {error !== undefined && (
          // Se anuncia, no solo se pinta de rojo.
          <p id={`list-name-error-${listId ?? 'new'}`} role="alert" className="text-danger text-sm">
            {error.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={blocked} className="mt-6">
        {blocked ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
