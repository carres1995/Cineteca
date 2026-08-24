// src/main.tsx — composición: es el ÚNICO sitio donde la infraestructura se
// enchufa a la presentación. De ahí para dentro, todo habla con puertos.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import './index.css';
import { envError } from '@/infrastructure/config/env';
import { createLocalLibraryRepository } from '@/infrastructure/storage/local-library-repository';
import { createTmdbCatalogRepository } from '@/infrastructure/tmdb/tmdb-catalog-repository';
import App from '@/presentation/app/App';
import { ConfigurationError } from '@/presentation/components/Common/ConfigurationError';
import { CatalogProvider } from '@/presentation/providers/catalog-provider';
import { LibraryProvider } from '@/presentation/providers/library-provider';
import { createQueryClient } from '@/presentation/providers/query-client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento root en el index.html');
}

const root = createRoot(rootElement);

if (envError !== null) {
  root.render(
    <StrictMode>
      <ConfigurationError detail={envError} />
    </StrictMode>,
  );
} else {
  const queryClient = createQueryClient();
  const catalog = createTmdbCatalogRepository();
  const library = createLocalLibraryRepository();

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <CatalogProvider catalog={catalog}>
          <LibraryProvider library={library}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LibraryProvider>
        </CatalogProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
