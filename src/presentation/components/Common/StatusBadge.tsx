// src/presentation/components/Common/StatusBadge.tsx
import type { ReleaseStatus } from '@/domain/catalog/release-status';
import { messages } from '@/presentation/i18n/messages';
import { cn } from '@/presentation/lib/cn';

/** Ningún estado se comunica solo con color: cada uno lleva su texto. */
export function StatusBadge({ status }: { status: ReleaseStatus }) {
  const { label, tone } = describe(status);

  return <span className={cn('rounded px-2 py-0.5 text-xs font-medium', tone)}>{label}</span>;
}

function describe(status: ReleaseStatus): { label: string; tone: string } {
  switch (status.kind) {
    case 'released':
      return {
        label: messages.status.released,
        tone: 'bg-status-released/15 text-status-released',
      };
    case 'upcoming':
      return {
        label: messages.status.upcoming,
        tone: 'bg-status-unreleased/15 text-status-unreleased',
      };
    case 'canceled':
      return { label: messages.status.canceled, tone: 'bg-danger/15 text-danger' };
    case 'unknown':
      return { label: messages.status.unknown, tone: 'bg-status-unknown/15 text-ink-muted' };
  }
}
