// src/presentation/components/Common/LoadingState.tsx
import { messages } from '@/presentation/i18n/messages';

/**
 * Un esqueleto con la forma de las tarjetas reales, no un spinner centrado:
 * comunica qué va a aparecer y evita que la cuadrícula salte al llegar los datos.
 */
export function LoadingState({ count = 10 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{messages.states.loading}</span>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="flex flex-col gap-2">
            <div className="aspect-poster bg-surface-raised rounded-card animate-pulse" />
            <div className="bg-surface-raised h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-surface-raised h-3 w-1/2 animate-pulse rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
}
