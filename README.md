# Cineteca

Cliente web para descubrir cine y armar una biblioteca personal. Consume la API pública de
**TMDB**: no hay servidor propio ni base de datos, y la biblioteca del usuario vive en su
navegador.

- **Explorar** el catálogo con filtros que viven en la URL.
- **Buscar** por texto, con espera antes de consultar.
- **Ficha** de cada película, pensada para compartirse por enlace.
- **Mi cineteca**: lo guardado y las listas temáticas locales.

---

## De cero a la app corriendo

### 1. Requisitos

| Herramienta | Versión  |
| ----------- | -------- |
| Node        | 22 o más |
| pnpm        | 11       |

```bash
corepack enable
```

### 2. Instalar

```bash
pnpm install
```

### 3. Poner la credencial de TMDB

Creá una cuenta en [themoviedb.org](https://www.themoviedb.org/) y entrá a
**Ajustes → API**. Ahí hay dos credenciales de solo lectura y **sirve cualquiera de las dos**:

| Credencial                     | Forma         | Cómo viaja                       |
| ------------------------------ | ------------- | -------------------------------- |
| **API Read Access Token** (v4) | un JWT largo  | cabecera `Authorization: Bearer` |
| **API Key** (v3)               | 32 caracteres | parámetro `api_key`              |

Copiá la plantilla y pegá la que tengas:

```bash
cp .env.template .env
# y editá VITE_TMDB_READ_TOKEN
```

La app detecta cuál es al arrancar (`src/infrastructure/config/env.ts`). Si falta o no tiene
forma de ninguna de las dos, no ves una pantalla en blanco: ves una pantalla que te dice qué
hacer.

> **La credencial es pública y eso es a propósito.** Va dentro del bundle, así que se puede
> encontrar. Compilá con `pnpm build` y buscala:
>
> ```bash
> grep -r "TU_CREDENCIAL" dist/assets/
> ```
>
> Aparece. Por eso se usa una cuenta de práctica y se rota en un minuto desde el panel de TMDB.
> Esconderla necesitaría un servidor propio, que está fuera del alcance de este proyecto.

### 4. Arrancar

```bash
pnpm dev
```

---

## Comandos

| Comando                         | Para qué                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                      | Servidor de desarrollo                                                                                 |
| `pnpm test`                     | Pruebas con cobertura y sus umbrales                                                                   |
| `pnpm test:watch`               | Pruebas en modo interactivo                                                                            |
| `pnpm smoke`                    | **Prueba de humo contra la API real**: comprueba que la credencial y los siete endpoints funcionan hoy |
| `pnpm lint`                     | ESLint, cero advertencias toleradas                                                                    |
| `pnpm check-types`              | TypeScript en modo estricto                                                                            |
| `pnpm build`                    | Build de producción                                                                                    |
| `bash scripts/verify.sh --full` | **El gate**: formato, linter, tipos, pruebas, build y versiones                                        |

`pnpm smoke` es la única cosa que sale a la red de verdad, y por eso **no** forma parte del
gate: un gate que depende de internet no es un gate. Las pruebas normales simulan la red con
MSW, usando respuestas reales de TMDB guardadas en `src/test/fixtures/`.

---

## Cómo está organizado

Clean Architecture, con **la regla de dependencia impuesta por el linter** (`eslint.config.js`):
las dependencias apuntan hacia dentro. La demostración de 60 segundos: importá un hook de React
dentro de `src/domain/` y mirá caer el linter.

```
src/
  domain/          TypeScript puro. Entidades, estados, políticas, formateadores, errores.
  application/     Puertos: "algo que trae películas", "algo que guarda la biblioteca".
  infrastructure/  Implementa los puertos: cliente HTTP, schemas de TMDB, almacenamiento local.
  presentation/    React y solo React: rutas, componentes, hooks de datos, textos.
  main.tsx         Composición: el ÚNICO sitio donde la infraestructura se enchufa a la presentación.
```

Ningún componente conoce Axios. Las pruebas doblan **los puertos**, no las librerías.

### Las dos reglas del dominio

1. **Prohibido un número que represente dinero fuera del tipo `Money`.** Un presupuesto es una
   cantidad entera en la unidad menor de su moneda, no un decimal flotante.
2. **Prohibido un `0` que signifique "no lo sé".** Los ceros y las cadenas vacías de TMDB mueren
   en el borde (`src/infrastructure/tmdb/tmdb-mappers.ts`): de ahí para dentro, `null` es la
   única forma de decir que falta un dato.

### Los tres bordes, los tres validados con Zod

| Borde                 | Dónde se valida                          | Qué pasa si viene roto                      |
| --------------------- | ---------------------------------------- | ------------------------------------------- |
| **La red**            | `infrastructure/tmdb/tmdb-schemas.ts`    | Error `invalidResponse`, localizado y claro |
| **El almacenamiento** | `domain/library/library-schema.ts`       | Se descarta y se empieza de cero            |
| **La URL**            | `domain/catalog/discover-filters-url.ts` | Cae a los valores por defecto               |

---

## Decisiones que conviene saber

- **El estado de la vista vive en la URL; el estado del servidor, en la caché de TanStack Query;
  la biblioteca, en su propio módulo.** Por eso no hay un almacén global de estado.
- **La ficha se pide en UNA petición**: `append_to_response=credits,videos,translations` trae
  elenco, tráilers y traducciones de una vez.
- **TMDB no sirve más allá de la página 500**, diga lo que diga `total_pages`. Ese tope se aplica
  en el borde y la paginación se detiene con un mensaje.
- **No se reintenta lo que no puede cambiar**: un 404 o una credencial inválida no se reintentan;
  un 429 se respeta UNA vez, con la espera que indica el servidor.
- **Guardar en la biblioteca es optimista**: se ve al instante y se revierte si la escritura falla.
- Los códigos de error de TMDB **no coinciden con los HTTP** (34 con 404, 22 con 400). Esa
  traducción ocurre una sola vez, en `infrastructure/http/map-http-error.ts`.

---

## Pruebas y cobertura

```bash
pnpm test
```

Umbrales que impone el gate:

- **100% en `src/domain/`** — es puro y barato de cubrir.
- **80% global.**

Las pruebas buscan por **rol accesible**: si un test encuentra un botón por su nombre, un lector
de pantalla también lo encuentra. No hay identificadores de prueba en el código.

---

## Despliegue

El build es estático (`dist/`), así que sirve cualquier hosting de archivos. La única
configuración necesaria es que **todas las rutas devuelvan `index.html`**, para que un enlace
profundo recargado (`/pelicula/238`) funcione. Ya está resuelta:

- **Netlify**: `public/_redirects`
- **Vercel**: `vercel.json`

```bash
pnpm build
```

Acordate de cargar `VITE_TMDB_READ_TOKEN` como variable de entorno en el panel del hosting: sin
ella, el build compila pero la app arranca mostrando la pantalla de configuración faltante.

---

## Atribución

Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB. El logo y la
frase están en el pie de todas las pantallas, como piden sus términos de uso.
