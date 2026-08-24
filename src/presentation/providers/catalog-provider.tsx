// src/presentation/providers/catalog-provider.tsx
import { createContext, use, type ReactNode } from 'react';
import type { CatalogPort } from '@/application/ports/catalog-port';

/**
 * La presentación recibe el PUERTO, no la implementación: por eso las pruebas
 * montan la app con un doble y jamás necesitan saber que existe Axios.
 */
const CatalogContext = createContext<CatalogPort | null>(null);

export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: CatalogPort;
  children: ReactNode;
}) {
  return <CatalogContext value={catalog}>{children}</CatalogContext>;
}

export function useCatalog(): CatalogPort {
  const catalog = use(CatalogContext);

  if (catalog === null) {
    throw new Error('useCatalog necesita estar dentro de <CatalogProvider>.');
  }

  return catalog;
}
