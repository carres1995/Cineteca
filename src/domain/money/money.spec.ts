// src/domain/money/money.spec.ts
import { describe, expect, it } from 'vitest';
import { formatMoney, moneyFromTmdbAmount } from './money';

describe('Money', () => {
  it('un 0 de TMDB significa "no lo sé", no "no costó nada"', () => {
    expect(moneyFromTmdbAmount(0)).toBeNull();
  });

  it('guarda el dinero en enteros de la unidad menor', () => {
    expect(moneyFromTmdbAmount(6_000_000)).toEqual({
      amountInMinorUnits: 600_000_000,
      currency: 'USD',
    });
  });

  it('un importe negativo o roto tampoco es dinero', () => {
    expect(moneyFromTmdbAmount(-5)).toBeNull();
    expect(moneyFromTmdbAmount(Number.NaN)).toBeNull();
  });

  it('los mismos 63 millones se ven distinto en cada locale, y las dos están bien', () => {
    const money = moneyFromTmdbAmount(63_000_000);

    expect(money).not.toBeNull();
    expect(formatMoney(money!, 'en-US')).toBe('$63,000,000');
    expect(formatMoney(money!, 'de-DE')).toMatch(/63\.000\.000/);
  });
});
