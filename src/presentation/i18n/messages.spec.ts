// src/presentation/i18n/messages.spec.ts
import { describe, expect, it } from 'vitest';
import type { ApiErrorDetail } from '@/domain/errors/api-error';
import { ApiError } from '@/domain/errors/api-error';
import { apiErrorMessage, errorMessage, messages } from './messages';

const everyKind: ApiErrorDetail[] = [
  { kind: 'network' },
  { kind: 'timeout' },
  { kind: 'canceled' },
  { kind: 'unauthorized' },
  { kind: 'notFound' },
  { kind: 'invalidRequest', detail: 'página inválida' },
  { kind: 'rateLimited', retryAfterMs: 3_000 },
  { kind: 'server', status: 500 },
  { kind: 'invalidResponse', detail: 'campo roto' },
  { kind: 'storageWrite' },
  { kind: 'unknown' },
];

describe('los mensajes de error', () => {
  it.each(everyKind)('$kind se dice en llano, sin códigos', (detail) => {
    const message = apiErrorMessage(detail);

    expect(message.length).toBeGreaterThan(0);
    expect(message).not.toMatch(/\b[45]\d\d\b(?! s)/);
  });

  it('el límite de tasa dice cuánto se espera', () => {
    expect(apiErrorMessage({ kind: 'rateLimited', retryAfterMs: 3_000 })).toContain('3 s');
  });

  it('un error que no es nuestro cae en el mensaje genérico', () => {
    expect(errorMessage(new Error('cualquiera'))).toBe(apiErrorMessage({ kind: 'unknown' }));
    expect(errorMessage(new ApiError({ kind: 'notFound' }))).toBe(
      apiErrorMessage({ kind: 'notFound' }),
    );
  });
});

describe('el nombre accesible de una tarjeta', () => {
  it('junta título, año y valoración', () => {
    expect(
      messages.card.accessibleName('El padrino', 1972, {
        kind: 'consolidated',
        average: 8.7,
        voteCount: 20_000,
      }),
    ).toBe('El padrino, 1972, 8,7 de 10 con 20.000 votos');
  });

  it('un solo voto va en singular', () => {
    expect(
      messages.card.accessibleName('Rara', 2020, {
        kind: 'provisional',
        average: 9,
        voteCount: 1,
      }),
    ).toContain('1 voto');
  });

  it('sin año y sin votos, lo dice con palabras', () => {
    expect(messages.card.accessibleName('Rara', null, { kind: 'unrated' })).toBe(
      'Rara, sin fecha de estreno, sin valoraciones',
    );
  });
});

describe('los plurales', () => {
  it('los decide Intl, no un if a mano', () => {
    expect(messages.states.votes(1)).toBe('voto');
    expect(messages.states.votes(0)).toBe('votos');
    expect(messages.library.count(1)).toBe('1 película');
    expect(messages.library.count(20_000)).toBe('20.000 películas');
  });
});
