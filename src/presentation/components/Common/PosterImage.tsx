// src/presentation/components/Common/PosterImage.tsx
import { ImageOff } from 'lucide-react';
import { messages } from '@/presentation/i18n/messages';
import { cn } from '@/presentation/lib/cn';

/**
 * La proporción se reserva ANTES de cargar: sin eso la cuadrícula salta cuando
 * llegan las imágenes. Y una película sin póster tiene marcador de posición,
 * no un icono roto.
 */
export function PosterImage({
  url,
  alt = '',
  className,
}: {
  url: string | null;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'aspect-poster bg-surface-raised rounded-card grid w-full place-items-center overflow-hidden',
        className,
      )}
    >
      {url === null ? (
        <span className="text-ink-muted flex flex-col items-center gap-1 p-2 text-center text-xs">
          <ImageOff aria-hidden="true" className="size-6" />
          {messages.states.noPoster}
        </span>
      ) : (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
