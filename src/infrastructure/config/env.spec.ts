// src/infrastructure/config/env.spec.ts
import { describe, expect, it } from 'vitest';
import { credentialSchema } from './env';

describe('la credencial de TMDB', () => {
  it('reconoce la API Key v3 por su forma', () => {
    expect(credentialSchema.parse('0123456789abcdef0123456789abcdef')).toEqual({
      kind: 'apiKey',
      key: '0123456789abcdef0123456789abcdef',
    });
  });

  it('reconoce el Read Access Token v4 por su largo', () => {
    const token = `eyJhbGciOiJIUzI1NiJ9.${'a'.repeat(40)}`;

    expect(credentialSchema.parse(token)).toEqual({ kind: 'readAccessToken', token });
  });

  it('rechaza cualquier otra cosa en vez de intentar la petición', () => {
    expect(credentialSchema.safeParse('pon-aqui-tu-credencial').success).toBe(false);
  });
});
