// src/presentation/hooks/use-image-urls.ts
import { useMemo } from 'react';
import { buildImageUrl, pickImageSize } from '@/domain/catalog/image-url';
import { useImageConfiguration } from './use-catalog-queries';

/** Los pósters de la cuadrícula piden el tamaño pequeño, no el original. */
const GRID_POSTER_SIZE = 'w342';
const DETAIL_POSTER_SIZE = 'w500';
const PROFILE_SIZE = 'w185';

/**
 * El catálogo de tamaños lo publica TMDB: acá solo se elige uno según dónde se
 * va a ver la imagen. Mientras la configuración no llegó, no hay URL —y la
 * tarjeta ya sabe pintar su marcador de posición—.
 */
export function useImageUrls() {
  const { data } = useImageConfiguration();

  return useMemo(() => {
    if (data === undefined) {
      return {
        gridPoster: () => null,
        detailPoster: () => null,
        profile: () => null,
      };
    }

    const base = data.secureBaseUrl;
    const grid = pickImageSize(data.posterSizes, GRID_POSTER_SIZE);
    const detail = pickImageSize(data.posterSizes, DETAIL_POSTER_SIZE);
    const profile = pickImageSize(data.profileSizes, PROFILE_SIZE);

    return {
      gridPoster: (path: string | null) => buildImageUrl(base, grid, path),
      detailPoster: (path: string | null) => buildImageUrl(base, detail, path),
      profile: (path: string | null) => buildImageUrl(base, profile, path),
    };
  }, [data]);
}
