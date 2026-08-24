// src/infrastructure/config/env.ts
import { z } from 'zod';

/**
 * TMDB ofrece DOS credenciales de solo lectura y viajan distinto: el "API Read
 * Access Token" (v4) va en la cabecera `Authorization: Bearer`, y la "API Key"
 * (v3) va como parámetro `api_key`. Cuál tenemos se decide acá, en el borde, y
 * el resto de la app no se entera nunca.
 */
export type TmdbCredential =
  | { readonly kind: 'readAccessToken'; readonly token: string }
  | { readonly kind: 'apiKey'; readonly key: string };

/** La v3 son 32 hexadecimales; la v4 es un JWT largo con puntos. */
export const credentialSchema = z.union(
  [
    z
      .string()
      .regex(/^[0-9a-f]{32}$/i)
      .transform((key): TmdbCredential => ({ kind: 'apiKey', key })),
    z
      .string()
      .min(40)
      .transform((token): TmdbCredential => ({ kind: 'readAccessToken', token })),
  ],
  'Esperábamos la API Key (32 caracteres) o el API Read Access Token de TMDB',
);

const envSchema = z.object({
  VITE_TMDB_READ_TOKEN: credentialSchema,
  VITE_TMDB_API_BASE: z.url().default('https://api.themoviedb.org'),
  VITE_TMDB_IMAGE_BASE: z.url().default('https://image.tmdb.org/t/p'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(import.meta.env);

/** `null` cuando la configuración es válida; el motivo, en castellano, si no. */
export const envError: string | null = parsed.success ? null : z.prettifyError(parsed.error);

/**
 * Con la configuración rota se exporta un objeto inerte a propósito: nadie
 * monta la app en ese caso (lo corta `main.tsx`), y así importar este módulo
 * nunca revienta a media carga.
 */
export const env: Env = parsed.success
  ? parsed.data
  : {
      VITE_TMDB_READ_TOKEN: { kind: 'apiKey', key: '' },
      VITE_TMDB_API_BASE: 'https://api.themoviedb.org',
      VITE_TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
    };

export const credential: TmdbCredential = env.VITE_TMDB_READ_TOKEN;
