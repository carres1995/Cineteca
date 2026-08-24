// src/domain/catalog/discover-filters-url.spec.ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS } from './discover-filters';
import { normalizeQuery, parseDiscoverFilters, toSearchParams } from './discover-filters-url';

const YEAR = 2026;
const parse = (query: string) => parseDiscoverFilters(new URLSearchParams(query), YEAR);

describe('la URL como borde no confiable', () => {
  it('sin parámetros usa los valores por defecto', () => {
    expect(parse('')).toEqual(DEFAULT_FILTERS);
  });

  it('lee unos filtros válidos', () => {
    expect(parse('genero=28&anio=1999&nota=7&votos=500&orden=revenue.desc&pagina=3')).toEqual({
      genreId: 28,
      year: 1999,
      minimumScore: 7,
      minimumVotes: 500,
      sortBy: 'revenue.desc',
      page: 3,
    });
  });

  it('un valor absurdo escrito a mano cae al defecto en vez de romper', () => {
    expect(parse('anio=abc&genero=-4&nota=99&votos=-1&orden=inventado&pagina=0')).toEqual(
      DEFAULT_FILTERS,
    );
  });

  it('respeta el tope de 500 páginas de la API', () => {
    expect(parse('pagina=900').page).toBe(1);
    expect(parse('pagina=500').page).toBe(500);
  });

  it('rechaza un año que todavía no existe', () => {
    expect(parse('anio=2100').year).toBeNull();
    expect(parse(`anio=${String(YEAR + 1)}`).year).toBe(YEAR + 1);
  });

  it('solo escribe en la URL lo que se aparta del defecto', () => {
    expect(toSearchParams(DEFAULT_FILTERS).toString()).toBe('');
    expect(toSearchParams({ ...DEFAULT_FILTERS, genreId: 28, page: 2 }).toString()).toBe(
      'genero=28&pagina=2',
    );
  });

  it('ida y vuelta: la URL reproduce la vista exacta', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      genreId: 18,
      year: 1972,
      sortBy: 'revenue.desc',
    } as const;

    expect(parse(toSearchParams(filters).toString())).toEqual(filters);
  });
});

describe('normalizeQuery', () => {
  it('el texto crudo no entra en la clave de caché', () => {
    expect(normalizeQuery('  El   PADRINO ')).toBe('el padrino');
  });
});
