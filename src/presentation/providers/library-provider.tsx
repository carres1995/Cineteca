// src/presentation/providers/library-provider.tsx
import { createContext, use, type ReactNode } from 'react';
import type { LibraryPort } from '@/application/ports/library-port';

const LibraryContext = createContext<LibraryPort | null>(null);

export function LibraryProvider({
  library,
  children,
}: {
  library: LibraryPort;
  children: ReactNode;
}) {
  return <LibraryContext value={library}>{children}</LibraryContext>;
}

export function useLibraryPort(): LibraryPort {
  const library = use(LibraryContext);

  if (library === null) {
    throw new Error('useLibraryPort necesita estar dentro de <LibraryProvider>.');
  }

  return library;
}
