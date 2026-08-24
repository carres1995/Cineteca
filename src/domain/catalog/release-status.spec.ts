// src/domain/catalog/release-status.spec.ts
import { describe, expect, it } from 'vitest';
import { releaseStatusFrom } from './release-status';

// La fecha entra por parámetro: una política que consulta el reloj por dentro
// no se puede probar sin trucos.
const TODAY = new Date('2026-08-24T00:00:00Z');

describe('releaseStatusFrom', () => {
  it('estrenada trae su fecha en la propia rama', () => {
    expect(releaseStatusFrom('Released', '1972-03-14', TODAY)).toEqual({
      kind: 'released',
      releaseDate: '1972-03-14',
    });
  });

  it('estrenada sin fecha es un estado desconocido, no una fecha inventada', () => {
    expect(releaseStatusFrom('Released', null, TODAY)).toEqual({ kind: 'unknown' });
  });

  it('en producción es "sin estrenar", con la fecha esperada si la hay', () => {
    expect(releaseStatusFrom('Post Production', '2027-01-01', TODAY)).toEqual({
      kind: 'upcoming',
      expectedDate: '2027-01-01',
    });
    expect(releaseStatusFrom('Planned', null, TODAY)).toEqual({
      kind: 'upcoming',
      expectedDate: null,
    });
  });

  it('cancelada no lleva fecha porque no significa nada', () => {
    expect(releaseStatusFrom('Canceled', '2027-01-01', TODAY)).toEqual({ kind: 'canceled' });
  });

  it('con un estado que no conocemos, la fecha decide', () => {
    expect(releaseStatusFrom('Vaya Usted A Saber', '2030-01-01', TODAY).kind).toBe('upcoming');
    expect(releaseStatusFrom('Vaya Usted A Saber', '2000-01-01', TODAY).kind).toBe('released');
    expect(releaseStatusFrom('Vaya Usted A Saber', null, TODAY).kind).toBe('unknown');
  });
});
