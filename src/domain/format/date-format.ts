// src/domain/format/date-format.ts
function formatUnit(value: number, unit: 'hour' | 'minute', locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * "2 h 15 min" no se arma concatenando strings a mano: lo arma Intl, que sabe
 * cómo se abrevia la unidad en cada idioma.
 */
export function formatRuntime(minutes: number, locale?: string): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return formatUnit(rest, 'minute', locale);
  if (rest === 0) return formatUnit(hours, 'hour', locale);

  return `${formatUnit(hours, 'hour', locale)} ${formatUnit(rest, 'minute', locale)}`;
}

/** Fecha larga en el locale del navegador: 14 de marzo de 1972 / March 14, 1972. */
export function formatReleaseDate(isoDate: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}
