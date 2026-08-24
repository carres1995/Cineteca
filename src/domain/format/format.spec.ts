// src/domain/format/format.spec.ts
import { describe, expect, it } from 'vitest';
import { formatReleaseDate, formatRuntime } from './date-format';
import { formatCount, formatRating, releaseYear } from './number-format';

describe('formatRuntime', () => {
  it('una duración larga se dice en horas y minutos', () => {
    expect(formatRuntime(135, 'es-ES')).toBe('2 h 15 min');
  });

  it('menos de una hora no inventa un "0 h"', () => {
    expect(formatRuntime(45, 'es-ES')).toBe('45 min');
  });

  it('una duración redonda no arrastra "0 min"', () => {
    expect(formatRuntime(120, 'es-ES')).toBe('2 h');
  });
});

describe('formatReleaseDate', () => {
  it('la misma fecha se escribe distinto en cada idioma', () => {
    expect(formatReleaseDate('1972-03-14', 'es-ES')).toBe('14 de marzo de 1972');
    expect(formatReleaseDate('1972-03-14', 'en-US')).toBe('March 14, 1972');
  });
});

describe('formatCount y formatRating', () => {
  it('los votos llevan separador de miles del locale, no uno escrito a mano', () => {
    expect(formatCount(20_000, 'es-ES')).toBe('20.000');
    expect(formatCount(20_000, 'en-US')).toBe('20,000');
  });

  it('la nota siempre lleva un decimal', () => {
    expect(formatRating(8, 'es-ES')).toBe('8,0');
    expect(formatRating(8.7, 'en-US')).toBe('8.7');
  });
});

describe('releaseYear', () => {
  it('sin fecha no hay año', () => {
    expect(releaseYear(null)).toBeNull();
  });

  it('saca el año de una fecha ISO', () => {
    expect(releaseYear('1972-03-14')).toBe(1972);
  });

  it('una fecha ilegible no se convierte en un año falso', () => {
    expect(releaseYear('sin-fecha')).toBeNull();
  });
});
