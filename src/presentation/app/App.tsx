// src/presentation/app/App.tsx
import { lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Routes } from 'react-router';
import { ErrorState } from '@/presentation/components/Common/ErrorState';
import { errorMessage } from '@/presentation/i18n/messages';
import { Layout } from './Layout';

// Cada ruta se descarga al visitarse: el arranque no paga por pantallas que
// nadie abrió todavía.
const HomePage = lazy(() => import('@/presentation/pages/HomePage'));
const DiscoverPage = lazy(() => import('@/presentation/pages/DiscoverPage'));
const SearchPage = lazy(() => import('@/presentation/pages/SearchPage'));
const MovieDetailPage = lazy(() => import('@/presentation/pages/MovieDetailPage'));
const LibraryPage = lazy(() => import('@/presentation/pages/LibraryPage'));
const ListDetailPage = lazy(() => import('@/presentation/pages/ListDetailPage'));
const NotFoundPage = lazy(() => import('@/presentation/pages/NotFoundPage'));

export default function App() {
  return (
    <ErrorBoundary
      // Un error de render no deja la pantalla en blanco.
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="bg-surface text-ink min-h-dvh p-6">
          <ErrorState message={errorMessage(error)} onRetry={resetErrorBoundary} />
        </div>
      )}
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explorar" element={<DiscoverPage />} />
          <Route path="buscar" element={<SearchPage />} />
          <Route path="pelicula/:id" element={<MovieDetailPage />} />
          <Route path="cineteca" element={<LibraryPage />} />
          <Route path="cineteca/listas/:id" element={<ListDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
