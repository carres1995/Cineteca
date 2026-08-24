// src/presentation/components/Common/PageHeading.tsx
import { useEffect, useRef } from 'react';
import { messages } from '@/presentation/i18n/messages';

/**
 * Al cambiar de ruta cambian el título del documento y la posición del foco.
 * Sin esto, el lector de pantalla sigue leyendo la página anterior: es la
 * diferencia entre una app navegable y una que solo se ve bien.
 */
export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${title} · ${messages.appName}`;
    heading.current?.focus();
  }, [title]);

  return (
    <div className="mb-6 space-y-1">
      <h1
        ref={heading}
        tabIndex={-1}
        className="focus-visible:outline-ink text-2xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {title}
      </h1>
      {subtitle !== undefined && <p className="text-ink-muted">{subtitle}</p>}
    </div>
  );
}
