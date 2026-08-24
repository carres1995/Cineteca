// src/presentation/components/Common/RatingBadge.tsx
import { Star } from 'lucide-react';
import type { Rating } from '@/domain/catalog/rating';
import { formatCount, formatRating } from '@/domain/format/number-format';
import { messages } from '@/presentation/i18n/messages';

/**
 * La valoración tiene su propio nivel tipográfico, y una nota con cuatro votos
 * se distingue de una consolidada CON TEXTO, no solo con un color distinto.
 */
export function RatingBadge({ rating }: { rating: Rating }) {
  switch (rating.kind) {
    case 'unrated':
      return <p className="text-ink-muted text-sm">{messages.states.noRating}</p>;

    case 'provisional':
    case 'consolidated':
      return (
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-rating text-ink inline-flex items-center gap-1 font-semibold">
            <Star aria-hidden="true" className="size-4 self-center" />
            {formatRating(rating.average)}
          </span>
          <span className="text-ink-muted text-xs">
            {formatCount(rating.voteCount)} {messages.states.votes(rating.voteCount)}
          </span>
          {rating.kind === 'provisional' && (
            <span className="text-status-unreleased text-xs font-medium">
              {messages.states.provisionalRating}
            </span>
          )}
        </p>
      );
  }
}
