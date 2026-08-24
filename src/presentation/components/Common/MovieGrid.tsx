// src/presentation/components/Common/MovieGrid.tsx
import { useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { MovieSummary } from '@/domain/catalog/movie-summary';
import { MovieCard } from './MovieCard';

/** Debajo de este número, virtualizar cuesta más de lo que ahorra. */
const VIRTUALIZE_FROM = 60;
const MIN_COLUMN_WIDTH = 190;
const ESTIMATED_ROW_HEIGHT = 380;

/**
 * La cuadrícula solo coloca: no sabe de dónde vienen las películas ni cómo se
 * arma la URL de un póster. `getPosterUrl` entra por props, y por eso sirve
 * igual en Explorar, en Buscar y en Mi cineteca.
 *
 * Con miles de tarjetas se virtualiza por filas contra el scroll de la ventana:
 * la memoria deja de crecer con el número de resultados. Con pocas se pinta
 * entera, que es más simple y más rápido.
 */
export function MovieGrid({
  movies,
  getPosterUrl,
  label,
}: {
  movies: readonly MovieSummary[];
  getPosterUrl: (movie: MovieSummary) => string | null;
  label: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, offsetTop: 0 });

  useLayoutEffect(() => {
    const element = container.current;
    if (element === null) return;

    const measure = () => {
      setSize({ width: element.clientWidth, offsetTop: element.offsetTop });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();

    return () => {
      observer.disconnect();
    };
  }, []);

  // Sin medida no hay ventana que calcular: se pinta entera y ya.
  const virtualize = movies.length >= VIRTUALIZE_FROM && size.width > 0;

  return (
    <div ref={container}>
      {virtualize ? (
        <VirtualRows
          movies={movies}
          columns={Math.max(1, Math.floor(size.width / MIN_COLUMN_WIDTH))}
          scrollMargin={size.offsetTop}
          getPosterUrl={getPosterUrl}
          label={label}
        />
      ) : (
        <ul
          aria-label={label}
          className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5"
        >
          {movies.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} posterUrl={getPosterUrl(movie)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VirtualRows({
  movies,
  columns,
  scrollMargin,
  getPosterUrl,
  label,
}: {
  movies: readonly MovieSummary[];
  columns: number;
  scrollMargin: number;
  getPosterUrl: (movie: MovieSummary) => string | null;
  label: string;
}) {
  const virtualizer = useWindowVirtualizer({
    count: Math.ceil(movies.length / columns),
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 2,
    // Sin esto, las filas se dibujan desplazadas cuando la cuadrícula no
    // empieza justo arriba del documento.
    scrollMargin,
  });

  return (
    // Filas virtuales, pero la lista sigue anunciando tarjetas: `role="list"` y
    // `role="listitem"` mantienen la semántica que el `<li>` por fila rompería.
    <div
      role="list"
      aria-label={label}
      className="relative"
      style={{ height: `${String(virtualizer.getTotalSize())}px` }}
    >
      {virtualizer.getVirtualItems().map((row) => {
        const from = row.index * columns;

        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 grid w-full gap-x-4 gap-y-6 pb-6"
            style={{
              transform: `translateY(${String(row.start - scrollMargin)}px)`,
              gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))`,
            }}
          >
            {movies.slice(from, from + columns).map((movie) => (
              <div role="listitem" key={movie.id}>
                <MovieCard movie={movie} posterUrl={getPosterUrl(movie)} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
