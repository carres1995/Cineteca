// src/presentation/components/Common/ErrorState.tsx
import { AlertTriangle } from 'lucide-react';
import { messages } from '@/presentation/i18n/messages';
import { Button } from './Button';

/** Lenguaje llano y una salida: un error sin botón es un callejón. */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="border-danger/40 bg-surface-raised rounded-card flex flex-col items-start gap-3 border p-6"
    >
      <p className="text-ink flex items-start gap-2">
        <AlertTriangle aria-hidden="true" className="text-danger mt-0.5 size-5 shrink-0" />
        {message}
      </p>
      <Button onClick={onRetry}>{messages.states.retry}</Button>
    </div>
  );
}
