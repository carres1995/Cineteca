// src/presentation/components/Common/ConfigurationError.tsx
import { messages } from '@/presentation/i18n/messages';

/**
 * Sin credencial no hay app: mejor una pantalla que se lee que un blanco con
 * un error en la consola.
 */
export function ConfigurationError({ detail }: { detail: string }) {
  return (
    <main className="bg-surface text-ink flex min-h-dvh items-center justify-center p-6">
      <div className="bg-surface-raised rounded-card max-w-xl space-y-4 p-6">
        <h1 className="text-xl font-semibold">{messages.config.missingTitle}</h1>
        <p className="text-ink-muted">{messages.config.missingHint}</p>
        <pre className="text-ink-muted overflow-x-auto text-sm whitespace-pre-wrap">{detail}</pre>
      </div>
    </main>
  );
}
