// src/presentation/components/Catalog/MovieDetail/Cast.tsx
import { UserRound } from 'lucide-react';
import type { CastMember } from '@/domain/catalog/movie-detail';
import { messages } from '@/presentation/i18n/messages';

/** El elenco puede no venir: eso también es un estado, no una lista vacía muda. */
export function Cast({
  cast,
  getProfileUrl,
}: {
  cast: readonly CastMember[];
  getProfileUrl: (member: CastMember) => string | null;
}) {
  return (
    <section aria-labelledby="movie-cast" className="space-y-4">
      <h2 id="movie-cast" className="text-lg font-semibold">
        {messages.detail.cast}
      </h2>

      {cast.length === 0 ? (
        <p className="text-ink-muted">{messages.detail.noCast}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {cast.map((member) => {
            const photo = getProfileUrl(member);

            return (
              <li key={member.id} className="space-y-1">
                <div className="aspect-poster bg-surface-raised rounded-card grid place-items-center overflow-hidden">
                  {photo === null ? (
                    <UserRound aria-hidden="true" className="text-ink-muted size-8" />
                  ) : (
                    <img
                      src={photo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="text-ink text-sm font-semibold">{member.name}</p>
                <p className="text-ink-muted text-xs">
                  {member.character ?? messages.detail.noData}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
