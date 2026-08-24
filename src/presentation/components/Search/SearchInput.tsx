// src/presentation/components/Search/SearchInput.tsx
import { Search } from 'lucide-react';
import { messages } from '@/presentation/i18n/messages';

/**
 * El input es tonto a propósito: avisa en cada tecla. La espera antes de
 * consultar la pone quien lo usa (`useDebouncedValue`), porque quien decide
 * cuándo se gasta una petición es el dueño del estado, no el campo de texto.
 */
export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="search-input" className="text-ink-muted text-sm">
        {messages.search.label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          id="search-input"
          type="search"
          value={value}
          placeholder={messages.search.placeholder}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          className="bg-surface-raised text-ink min-h-touch focus-visible:outline-ink w-full rounded py-2 pr-3 pl-9 focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>
    </div>
  );
}
