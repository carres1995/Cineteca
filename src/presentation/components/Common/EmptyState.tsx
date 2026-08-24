// src/presentation/components/Common/EmptyState.tsx
import type { ReactNode } from 'react';

/**
 * Un vacío sin salida es un callejón: convertirlo en una acción es la mitad del
 * trabajo de experiencia de este proyecto, y por eso `action` existe.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-surface-raised rounded-card flex flex-col items-start gap-3 p-6">
      <h3 className="text-ink font-semibold">{title}</h3>
      <p className="text-ink-muted">{description}</p>
      {action}
    </div>
  );
}
