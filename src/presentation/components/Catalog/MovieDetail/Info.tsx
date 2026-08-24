// src/presentation/components/Catalog/MovieDetail/Info.tsx
import { Info as InfoIcon } from 'lucide-react';
import type { MovieDetail, Synopsis } from '@/domain/catalog/movie-detail';
import { formatRuntime } from '@/domain/format/date-format';
import { formatMoney, type Money } from '@/domain/money/money';
import { messages } from '@/presentation/i18n/messages';

/**
 * Un presupuesto desconocido se ve como "Sin dato", nunca como "$0". El tipo ya
 * lo dice —`Money | null`—, y acá la pantalla está obligada a tratarlo.
 */
function moneyText(money: Money | null): string {
  return money === null ? messages.detail.noData : formatMoney(money);
}

/**
 * La sinopsis que no existe en español no es un hueco: se ofrece la que hay y
 * se avisa en qué idioma está.
 */
function SynopsisBlock({ synopsis }: { synopsis: Synopsis }) {
  switch (synopsis.kind) {
    case 'none':
      return <p className="text-ink-muted">{messages.detail.noSynopsis}</p>;

    case 'localized':
      return <p className="text-ink max-w-prose">{synopsis.text}</p>;

    case 'fallback':
      return (
        <div className="space-y-2">
          <p className="text-ink-muted flex items-start gap-2 text-sm">
            <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {messages.detail.synopsisFallback(synopsis.language)}
          </p>
          <p className="text-ink max-w-prose" lang="en">
            {synopsis.text}
          </p>
        </div>
      );
  }
}

export function Info({ movie }: { movie: MovieDetail }) {
  return (
    <section aria-labelledby="movie-info" className="space-y-6">
      <h2 id="movie-info" className="text-lg font-semibold">
        {messages.detail.synopsis}
      </h2>

      <SynopsisBlock synopsis={movie.synopsis} />

      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-ink-muted text-sm">{messages.detail.originalTitle}</dt>
          <dd className="text-ink">{movie.originalTitle}</dd>
        </div>
        <div>
          <dt className="text-ink-muted text-sm">{messages.detail.runtime}</dt>
          <dd className="text-ink">
            {movie.runtimeMinutes === null
              ? messages.detail.noData
              : formatRuntime(movie.runtimeMinutes)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted text-sm">{messages.detail.budget}</dt>
          <dd className="text-ink">{moneyText(movie.budget)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted text-sm">{messages.detail.revenue}</dt>
          <dd className="text-ink">{moneyText(movie.revenue)}</dd>
        </div>
      </dl>
    </section>
  );
}
