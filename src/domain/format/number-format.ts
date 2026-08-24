// src/domain/format/number-format.ts
/**
 * El formateo no se escribe a mano: un separador de miles puesto con `replace`
 * es un bug esperando un idioma. El locale entra por parámetro; `undefined`
 * significa "el del navegador", que es la preferencia de quien mira.
 */
export function formatRating(average: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);
}

export function formatCount(count: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(count);
}

/** Año de una fecha ISO de TMDB. `null` entra, `null` sale. */
export function releaseYear(isoDate: string | null): number | null {
  if (isoDate === null) return null;

  const year = Number.parseInt(isoDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}
