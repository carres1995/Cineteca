// src/domain/catalog/rating.spec.ts
import { describe, expect, it } from 'vitest';
import { ratingFrom } from './rating';

describe('ratingFrom', () => {
  it('sin votos no hay nota: es ausencia de dato, no un 0,0', () => {
    expect(ratingFrom(0, 0)).toEqual({ kind: 'unrated' });
  });

  it('un puñado de votos da una nota provisional', () => {
    expect(ratingFrom(9, 4, 50)).toEqual({ kind: 'provisional', average: 9, voteCount: 4 });
  });

  it('a partir del umbral la nota está consolidada', () => {
    expect(ratingFrom(8.7, 50, 50)).toEqual({
      kind: 'consolidated',
      average: 8.7,
      voteCount: 50,
    });
  });

  it('el umbral entra por parámetro, no se consulta por dentro', () => {
    expect(ratingFrom(7, 10, 5).kind).toBe('consolidated');
    expect(ratingFrom(7, 10, 20).kind).toBe('provisional');
  });
});
