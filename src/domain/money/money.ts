// src/domain/money/money.ts
/**
 * Un presupuesto NO es un número con decimales flotantes: esa aritmética pierde
 * céntimos. Es una cantidad entera en la unidad menor de su moneda, y la moneda
 * viaja con ella. Prohibido un número que represente dinero fuera de este tipo.
 */
export interface Money {
  readonly amountInMinorUnits: number;
  /** Código ISO 4217. La moneda es un dato de la película, no del que mira. */
  readonly currency: string;
}

/** TMDB reporta presupuestos y recaudaciones en dólares enteros. */
export const TMDB_CURRENCY = 'USD';
const MINOR_UNITS_PER_UNIT = 100;

/**
 * `0` en TMDB significa "no lo sé", no "no costó nada": acá muere ese cero.
 * Devolver `null` obliga a la pantalla a decir "Sin dato".
 */
export function moneyFromTmdbAmount(wholeUnits: number, currency = TMDB_CURRENCY): Money | null {
  if (!Number.isFinite(wholeUnits) || wholeUnits <= 0) return null;

  return {
    amountInMinorUnits: Math.round(wholeUnits * MINOR_UNITS_PER_UNIT),
    currency,
  };
}

/**
 * La división por 100 pasa acá y solo acá: es el paso de "cantidad exacta" a
 * "cómo se ve". El formato lo resuelve Intl, nunca un `replace` a mano.
 */
export function formatMoney(money: Money, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amountInMinorUnits / MINOR_UNITS_PER_UNIT);
}
