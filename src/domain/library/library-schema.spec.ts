// src/domain/library/library-schema.spec.ts
import { describe, expect, it } from 'vitest';
import { EMPTY_LIBRARY } from './library';
import { parseLibrary } from './library-schema';

const stored = JSON.stringify({
  entries: [
    {
      movie: {
        id: 238,
        title: 'El padrino',
        posterPath: null,
        releaseDate: '1972-03-14',
        overview: null,
        rating: { kind: 'consolidated', average: 8.7, voteCount: 20000 },
      },
      savedAt: '2026-08-24T10:00:00.000Z',
    },
  ],
  lists: [],
});

describe('el almacenamiento local, validado al leer', () => {
  it('sin nada guardado, biblioteca vacía', () => {
    expect(parseLibrary(null)).toEqual(EMPTY_LIBRARY);
  });

  it('lee lo que escribió la propia app', () => {
    expect(parseLibrary(stored).entries[0]?.movie.title).toBe('El padrino');
  });

  it('un JSON roto se descarta sin tumbar la app', () => {
    expect(parseLibrary('{esto no es json')).toEqual(EMPTY_LIBRARY);
  });

  it('un JSON válido con la forma equivocada también se descarta', () => {
    expect(parseLibrary('{"entries":"todas","lists":[]}')).toEqual(EMPTY_LIBRARY);
  });

  it('una valoración inventada no entra: el estado es un conjunto cerrado', () => {
    const tampered = stored.replace('"consolidated"', '"buenisima"');

    expect(parseLibrary(tampered)).toEqual(EMPTY_LIBRARY);
  });
});
