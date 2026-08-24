# Guía de Cineteca — de React básico a las herramientas del proyecto

Esta guía explica **cómo funciona todo el proyecto y por qué**. Está pensada para leerse de
arriba abajo: empieza por lo más básico de React y termina en las decisiones avanzadas que
sostienen la app. Cada concepto se explica **con el código real del repositorio**, no con
ejemplos inventados.

> Si algo no lo podés explicar, no lo entendés todavía. Al final hay una sección de preguntas
> para comprobarlo.

---

## Índice

1. [Cómo correrlo y probarlo](#1-cómo-correrlo-y-probarlo)
2. [El mapa del proyecto](#2-el-mapa-del-proyecto)
3. [React desde cero](#3-react-desde-cero)
4. [Las herramientas, una por una](#4-las-herramientas-una-por-una)
5. [La arquitectura: capas y puertos](#5-la-arquitectura-capas-y-puertos)
6. [Dos recorridos completos](#6-dos-recorridos-completos)
7. [Preguntas para comprobar que lo entendiste](#7-preguntas-para-comprobar-que-lo-entendiste)

---

## 1. Cómo correrlo y probarlo

### Arrancar

```bash
pnpm install          # una sola vez
pnpm dev              # http://localhost:5173
```

Necesitás un `.env` con `VITE_TMDB_READ_TOKEN`. Si falta, la app **no explota**: muestra una
pantalla que te dice exactamente qué hacer (`ConfigurationError.tsx`).

### Qué probar en el navegador

| Prueba                      | Qué hacer                                                                             | Qué tenés que ver                                                        |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Los cuatro estados**      | Abrí `/explorar` con las DevTools en «Slow 3G»                                        | Esqueleto → cuadrícula. Nunca un spinner centrado                        |
| **Vacío por filtro**        | `/explorar?genero=99&anio=1900`                                                       | «Ninguna película coincide» **con botón para limpiar**                   |
| **La URL es el estado**     | Poné filtros, copiá la URL, pegala en otra ventana                                    | La misma vista exacta                                                    |
| **La URL es un borde**      | `/explorar?anio=abc&orden=inventado&pagina=-2`                                        | No se rompe: cae a los valores por defecto                               |
| **Una petición, no diez**   | Pestaña Network, escribí «el padrino» en `/buscar`                                    | **Una** llamada a `/search/movie`, no una por tecla                      |
| **Error y reintento**       | DevTools → Offline → recargá `/explorar`                                              | «No pudimos conectarnos» + botón Reintentar que funciona                 |
| **Guardado optimista**      | Clic en el corazón de una tarjeta                                                     | Se pinta al instante, antes de que el disco responda                     |
| **Vuelta atrás**            | En consola: `localStorage.setItem = () => { throw new Error() }` y clic en el corazón | El corazón **vuelve solo** a su sitio                                    |
| **Almacenamiento corrupto** | `localStorage.setItem('cineteca:library:v1','basura')` y recargá                      | La app arranca con la biblioteca vacía, no en blanco                     |
| **Ausencias**               | Abrí una película sin presupuesto                                                     | «Sin dato», nunca «$0»                                                   |
| **Formatos por idioma**     | Cambiá el idioma del navegador a alemán y recargá                                     | `63.000.000 $`, fechas alemanas, y el diseño aguanta                     |
| **Teclado**                 | Guardá el ratón. Tab desde arriba                                                     | Primer tab: «Saltar al contenido». Todo alcanzable, foco siempre visible |
| **Cambio de ruta**          | Navegá entre secciones                                                                | Cambia el título de la pestaña y el foco salta al `<h1>`                 |
| **Zoom**                    | Ctrl + `+` hasta 200%                                                                 | Sin scroll horizontal ni cortes                                          |

### Comandos de verificación

```bash
pnpm test                        # 193 pruebas + umbrales de cobertura
pnpm smoke                       # sale a la API REAL: ¿funciona hoy la conexión?
bash scripts/verify.sh --full    # el gate completo (lo mismo que corre el CI)
```

---

## 2. El mapa del proyecto

```
src/
├── domain/          ← TypeScript puro. No sabe que existe React.
├── application/     ← Puertos (interfaces). No sabe cómo viajan los datos.
├── infrastructure/  ← Implementa los puertos: HTTP, TMDB, localStorage.
├── presentation/    ← React y solo React.
└── main.tsx         ← Composición: el único sitio donde todo se enchufa.
```

La flecha de dependencia apunta **siempre hacia dentro**: `presentation → application → domain`.
La infraestructura también apunta hacia dentro (implementa lo que la aplicación define).

Esto no es un dibujo: lo impone el linter. Probalo — poné `import { useState } from 'react'` en
cualquier archivo de `src/domain/` y corré `pnpm lint`. Falla.

---

## 3. React desde cero

### 3.1 Un componente es una función que devuelve JSX

Lo más básico de React: una función con nombre en mayúscula que devuelve algo parecido a HTML.

```tsx
// src/presentation/components/Common/EmptyState.tsx (simplificado)
export function EmptyState({ title, description }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

**JSX no es HTML**: se compila a llamadas de función. Por eso:

- `class` se escribe `className` (`class` es palabra reservada de JavaScript).
- Las llaves `{}` meten JavaScript dentro del marcado: `{title}` inserta el valor de la variable.
- Un componente devuelve **un solo** elemento raíz. Si necesitás varios sin envoltorio, usás un
  _fragment_: `<>...</>` (lo verás en `HomePage.tsx`).

### 3.2 Props: los datos entran por arriba

Las `props` son los argumentos del componente. Son **de solo lectura**: un componente nunca
modifica sus props.

```tsx
// src/presentation/components/Common/MovieCard.tsx
export function MovieCard({ movie, posterUrl }: { movie: MovieSummary; posterUrl: string | null }) {
```

Fijate en el tipo escrito ahí mismo: TypeScript garantiza que nadie use `<MovieCard />` sin
pasarle una película. Ese `string | null` en `posterUrl` es intencional: **el tipo obliga** a
tratar el caso «esta película no tiene póster».

**Regla del proyecto:** los componentes de presentación reciben datos por props y no consultan la
red. `MovieGrid` no sabe de dónde salen las películas; recibe hasta la función que arma la URL
del póster:

```tsx
// src/presentation/components/Common/MovieGrid.tsx
getPosterUrl: (movie: MovieSummary) => string | null;
```

Eso se llama **inversión de dependencia a nivel de componente**, y es la razón de que la misma
cuadrícula sirva en Explorar, en Buscar, en la ficha y en Mi cineteca.

### 3.3 Renderizado condicional y listas

```tsx
// Condicional con operador ternario
{movies.length === 0 ? <EmptyState ... /> : <MovieGrid ... />}

// Condicional con && (si la izquierda es falsa, no se pinta nada)
{movie.tagline !== null && <p>{movie.tagline}</p>}

// Lista
{movies.map((movie) => (
  <li key={movie.id}>
    <MovieCard movie={movie} posterUrl={getPosterUrl(movie)} />
  </li>
))}
```

**El `key` no es decorativo.** React lo usa para saber qué elemento es cuál entre dos renders. Sin
`key` (o con `key={index}` en una lista que se reordena), React reutiliza el nodo equivocado y
aparecen bugs raros: un input con el texto de otra fila, una animación en el sitio incorrecto. Se
usa el **id estable del dato**, no la posición.

### 3.4 Estado: `useState`

El estado es la memoria de un componente entre renders. Cuando cambia, React vuelve a pintar.

```tsx
// src/presentation/pages/SearchPage.tsx
const [text, setText] = useState(() => searchParams.get(FILTER_PARAMS.query) ?? '');
```

Tres cosas que aprender de esa línea:

1. `useState` devuelve **un par**: el valor y la función para cambiarlo.
2. Le pasamos una **función** en vez de un valor (`() => ...`). Eso es el _lazy initial state_:
   el cálculo solo corre en el primer render, no en todos.
3. El estado es **inmutable**: nunca `text = 'otra cosa'`; siempre `setText('otra cosa')`.

### 3.5 Eventos

```tsx
onChange={(event) => {
  onChange(event.target.value);
}}
```

React normaliza los eventos del navegador. El patrón del proyecto es **elevar el evento**: el
`SearchInput` no decide qué hacer con el texto, solo avisa. Quien lo usa decide. Eso lo hace
reutilizable y probable.

### 3.6 Efectos: `useEffect` (y cuándo NO usarlo)

Un efecto sincroniza el componente con algo **de fuera de React**: el título del documento, un
temporizador, la URL.

```tsx
// src/presentation/components/Common/PageHeading.tsx
useEffect(() => {
  document.title = `${title} · ${messages.appName}`;
  heading.current?.focus();
}, [title]);
```

- El **array de dependencias** (`[title]`) dice cuándo volver a ejecutarlo. Si lo omitís, corre en
  cada render; si ponés `[]`, solo al montar.
- Si el efecto crea algo que hay que deshacer, devuelve una **función de limpieza**:

```tsx
// src/presentation/hooks/use-debounced-value.ts
useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delayMs);
  return () => clearTimeout(timer); // ← limpieza
}, [value, delayMs]);
```

Ese `clearTimeout` es exactamente lo que hace que tipear diez letras dispare **una** petición: cada
tecla cancela el temporizador anterior.

**El error más común de React es usar `useEffect` para todo.** En este proyecto **no** hay
efectos para traer datos: de eso se encarga TanStack Query. Casi todo lo que parece necesitar un
efecto es en realidad un valor derivado que se puede calcular durante el render:

```tsx
// src/presentation/pages/DiscoverPage.tsx — se calcula, no se guarda en estado
const filters = parseDiscoverFilters(searchParams, currentYear);
const movies = results.data?.pages.flatMap((page) => page.results) ?? [];
```

### 3.7 Referencias: `useRef`

Un `ref` es una caja mutable que **no** provoca renders. Se usa para hablar con el DOM:

```tsx
const heading = useRef<HTMLHeadingElement>(null);
// ...
<h1 ref={heading} tabIndex={-1}>
```

`tabIndex={-1}` hace que un elemento que normalmente no recibe foco pueda recibirlo por código
(pero siga fuera del recorrido del tabulador). Así, al cambiar de ruta, el lector de pantalla
empieza a leer la página nueva.

### 3.8 Context: datos que atraviesan el árbol

Pasar una prop por seis niveles es _prop drilling_. El Context lo evita.

```tsx
// src/presentation/providers/catalog-provider.tsx
const CatalogContext = createContext<CatalogPort | null>(null);

export function CatalogProvider({ catalog, children }) {
  return <CatalogContext value={catalog}>{children}</CatalogContext>;
}

export function useCatalog(): CatalogPort {
  const catalog = use(CatalogContext);
  if (catalog === null) throw new Error('useCatalog necesita estar dentro de <CatalogProvider>.');
  return catalog;
}
```

Dos detalles avanzados:

- `use(Context)` es la API de React 19 (antes `useContext`). Y en React 19 el proveedor se escribe
  `<CatalogContext value={...}>`, sin `.Provider`.
- El `throw` convierte un error silencioso en uno con nombre. Si alguien usa el hook fuera del
  proveedor, se entera al instante.

**Qué guardamos en Context y qué no:** solo los **puertos** (el catálogo y la biblioteca). El
Context aquí es inyección de dependencias, no un almacén de estado. Los datos viven en la caché de
Query.

### 3.9 Hooks propios

Un hook propio es una función que empieza por `use` y compone otros hooks. Sirve para reutilizar
**lógica**, no marcado.

```tsx
// src/presentation/hooks/use-debounced-value.ts
export function useDebouncedValue<T>(value: T, delayMs = 400): T;
```

Es genérico (`<T>`): sirve para un texto, un número o un objeto. Y separa la responsabilidad: el
componente de búsqueda escribe en cada tecla, y **quien lo usa** decide cuánto esperar.

### 3.10 Carga perezosa: `lazy` + `Suspense`

```tsx
// src/presentation/app/App.tsx
const DiscoverPage = lazy(() => import('@/presentation/pages/DiscoverPage'));
```

`lazy` + `import()` dinámico parten el bundle: el código de Explorar se descarga **cuando alguien
entra a Explorar**. Mientras llega, React necesita algo que mostrar, y eso es `Suspense`:

```tsx
// src/presentation/app/Layout.tsx
<Suspense fallback={<LoadingState />}>
  <Outlet />
</Suspense>
```

Podés verlo funcionando: `pnpm build` y mirá que hay un `.js` por página.

### 3.11 Error boundaries

Un error durante el render deja la pantalla en blanco. Un _error boundary_ lo atrapa:

```tsx
// src/presentation/app/App.tsx
<ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
  <ErrorState message={errorMessage(error)} onRetry={resetErrorBoundary} />
)}>
```

Usamos `react-error-boundary` porque en React esto solo puede hacerlo un componente de clase, y
esa librería lo envuelve en algo usable.

### 3.12 `StrictMode`

En `main.tsx` verás `<StrictMode>`. En desarrollo monta cada componente **dos veces** a propósito,
para delatar efectos sin limpieza. Si algo se rompe solo en desarrollo y «se arregla» quitando
StrictMode, el bug es tuyo, no de React.

---

## 4. Las herramientas, una por una

### 4.1 TypeScript estricto: el tipo dice la verdad

El proyecto compila con `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`
(`tsconfig.app.json`). Lo importante no es la configuración, sino **cómo se modela**.

**Uniones discriminadas.** Un estado no es un booleano ni un string suelto: es un conjunto cerrado
de variantes, y **cada rama trae exactamente los datos que le corresponden**.

```ts
// src/domain/catalog/rating.ts
export type Rating =
  | { kind: 'unrated' }
  | { kind: 'provisional'; average: number; voteCount: number }
  | { kind: 'consolidated'; average: number; voteCount: number };
```

Si una película no tiene votos, **no existe** un `average` que leer por accidente. El compilador
lo impide.

Al consumirla, un `switch` sin `default`:

```tsx
// src/presentation/components/Common/RatingBadge.tsx
switch (rating.kind) {
  case 'unrated':
    return <p>Sin valoraciones</p>;
  case 'provisional':
  case 'consolidated':
    return ( ... );
}
```

Si mañana TMDB añade un estado nuevo y lo agregamos al tipo, **este archivo deja de compilar**.
Eso es una red de seguridad, no una molestia.

Lo mismo para los errores (`ApiErrorDetail`), el estado de estreno (`ReleaseStatus`) y la sinopsis
(`Synopsis`).

**El dinero, en enteros.**

```ts
// src/domain/money/money.ts
export interface Money {
  readonly amountInMinorUnits: number; // centavos
  readonly currency: string;
}
```

Los flotantes pierden céntimos (`0.1 + 0.2 !== 0.3`). Se guarda entero y **solo se divide para
mostrar**. Además, la moneda viaja con la cantidad: la moneda es un dato de la película, el
formato es preferencia de quien mira.

### 4.2 Zod: el schema **es** el tipo

Zod valida datos en tiempo de ejecución y de ahí saca el tipo de TypeScript. Un solo sitio para
las dos cosas.

```ts
// src/infrastructure/tmdb/tmdb-schemas.ts
export const movieSummarySchema = z.object({
  id: z.int(),
  title: z.string(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
});
export type MovieSummaryDto = z.infer<typeof movieSummarySchema>; // ← el tipo sale del schema
```

`safeParse` no lanza: devuelve `{ success: true, data }` o `{ success: false, error }`. Eso
permite decidir qué hacer en cada borde:

| Borde        | Archivo                                  | Si viene roto                       |
| ------------ | ---------------------------------------- | ----------------------------------- |
| Red          | `tmdb-http-client.ts` → `requestJson`    | Error `invalidResponse` con detalle |
| localStorage | `domain/library/library-schema.ts`       | Se descarta, biblioteca vacía       |
| URL          | `domain/catalog/discover-filters-url.ts` | Cae a los valores por defecto       |

**Nunca se usa una afirmación de tipo (`as`) sobre datos externos.** `as` le miente al compilador;
Zod le pregunta a los datos.

### 4.3 Axios: una instancia, interceptores, cancelación

```ts
// src/infrastructure/http/tmdb-http-client.ts
const client = axios.create({
  baseURL: `${env.VITE_TMDB_API_BASE}/3`,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { ...auth.headers, Accept: 'application/json' },
  params: { ...auth.params, language: TMDB_LANGUAGE },
});

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
```

- **Una sola instancia**: la credencial y el idioma se configuran una vez, no en cada llamada.
- **Interceptor de respuesta**: es el punto exacto donde un error crudo de Axios se convierte en
  un `ApiError` del dominio. Hacia dentro **solo cruzan `ApiError`**, y por eso ningún componente
  importa Axios (el linter lo prohíbe fuera de `infrastructure/http`).
- **La traducción de errores de TMDB** vive en `map-http-error.ts`: su código 34 es un 404, su 22
  es un 400, un 429 trae `Retry-After`. Se traduce **una vez**.

### 4.4 TanStack Query: el estado del servidor no es estado de la app

Este es el cambio mental más grande del proyecto. Los datos que vienen de una API **no son tuyos**:
son una copia que caduca. Query los gestiona por vos.

```ts
// src/presentation/hooks/use-catalog-queries.ts
export function useTrendingMovies(page = 1) {
  const catalog = useCatalog();
  return useQuery({
    queryKey: catalogKeys.trendingPage(page),
    queryFn: ({ signal }) => catalog.getTrendingMoviesOfWeek(page, { signal }),
    staleTime: HOUR,
  });
}
```

**La clave (`queryKey`)** es la identidad de la consulta. Si cambia, es otra consulta. Son
jerárquicas (`catalog-keys.ts`) para poder invalidar por rama:

```
['catalog']                                   ← todo el catálogo
['catalog','discover',{genreId:28,...}]       ← solo esa consulta de Explorar
```

Y se **normalizan** antes de entrar: `" El   PADRINO "` y `"el padrino"` son la misma búsqueda. Si
el texto crudo entrara en la clave, serían dos entradas de caché y dos peticiones.

**`staleTime`** es cuánto tiempo un dato se considera fresco. Se justifica por tipo de dato:

| Dato          | Frescura   | Por qué                          |
| ------------- | ---------- | -------------------------------- |
| Configuración | `Infinity` | Cambia una vez cada nunca        |
| Géneros       | 24 h       | Se mueven un par de veces al año |
| Tendencias    | 1 h        | Son semanales                    |
| Búsqueda      | 5 min      | Cambian poco en una sesión       |

**`signal`**: Query da un `AbortSignal` al `queryFn` y lo pasamos a Axios. Si el usuario cambia de
pantalla, la petición se cancela sola.

**Reintentos** (`providers/query-client.ts`): no se reintenta lo que no puede cambiar. Un 404 o una
credencial inválida se reintentan cero veces; un 429 se reintenta **una** y esperando lo que dijo
el servidor. Reintentar en bucle un límite de tasa es la forma más rápida de que te bloqueen.

**Paginación infinita**:

```ts
useInfiniteQuery({
  initialPageParam: filters.page,
  getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
});
```

Devolver `undefined` es decir «no hay más». Y `totalPages` ya viene recortado a 500 en el borde,
porque TMDB no sirve más allá aunque diga que sí.

**Mutación optimista con vuelta atrás** (`hooks/use-library.ts`) — el patrón completo:

```ts
onMutate: async (input) => {
  await queryClient.cancelQueries({ queryKey: libraryKeys.all }); // 1. cancelar lo que vuela
  const previous = queryClient.getQueryData(libraryKeys.all);      // 2. foto del antes
  queryClient.setQueryData(libraryKeys.all, apply(previous, input));// 3. pintar ya
  return { previous };
},
onError: (_e, _i, context) => {
  queryClient.setQueryData(libraryKeys.all, context.previous);      // 4. deshacer si falla
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: libraryKeys.all });     // 5. confirmar con la verdad
},
```

¿Por qué el paso 1? Porque si hay una lectura en vuelo y responde **después** de que pintamos el
cambio, esa respuesta vieja pisaría lo que el usuario acaba de hacer.

Y un detalle que costó un bug real: el `mutationFn` lee del **almacenamiento**, no de la caché. La
caché ya tiene aplicado el cambio optimista, y volver a aplicarlo encima lo desharía.

### 4.5 React Router: la URL es estado compartible

```tsx
// src/presentation/app/App.tsx
<Route element={<Layout />}>
  <Route index element={<HomePage />} />
  <Route path="explorar" element={<DiscoverPage />} />
  <Route path="pelicula/:id" element={<MovieDetailPage />} />
</Route>
```

- **Rutas anidadas**: `Layout` pinta la cabecera y el pie, y `<Outlet />` es el agujero donde entra
  la ruta hija.
- `:id` es un parámetro dinámico; se lee con `useParams()`.
- `useSearchParams()` lee y escribe el _query string_.

**La decisión clave de todo el proyecto**: los filtros de Explorar **no** viven en `useState`,
viven en la URL.

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const filters = parseDiscoverFilters(searchParams, currentYear); // leer + validar
const applyFilters = (next) => setSearchParams(toSearchParams(next)); // escribir
```

Consecuencias gratis: recargar mantiene la vista, el botón «atrás» funciona, y compartir el enlace
reproduce exactamente lo que veías. Con `useState` no tendrías ninguna de las tres.

### 4.6 React Hook Form + Zod: un solo schema valida y tipa

```tsx
// src/presentation/components/Library/ListForm.tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<ListFormValues>({
  resolver: zodResolver(listFormSchema(library, listId)),
  defaultValues: { name: defaultName },
});
```

- `register('name')` conecta el input al formulario **sin estado de React por tecla**: por eso
  escribir en un formulario grande no vuelve a pintar toda la pantalla.
- `zodResolver` conecta el schema: valida **y** tipa `ListFormValues`.
- El schema no reimplementa la regla, **llama al dominio**:

```ts
z.string().superRefine((name, ctx) => {
  const problem = validateListName(library, name, ignoreListId);
  if (problem !== null) ctx.addIssue({ code: 'custom', message: messages.lists.problems[problem] });
});
```

Si la regla estuviera escrita en el formulario **y** en el dominio, tarde o temprano divergen. Acá
hay una sola fuente y tres motivos de bloqueo distintos (vacío, demasiado largo, repetido), cada
uno con **su propio mensaje**.

Accesibilidad del formulario, que es parte de la funcionalidad y no un extra:

```tsx
aria-invalid={error !== undefined}
aria-describedby={...}
<p role="alert">{error.message}</p>
```

`role="alert"` hace que el lector de pantalla **anuncie** el error. Pintarlo de rojo no es
suficiente: alguien que no ve el rojo no se entera de nada.

### 4.7 Tailwind CSS v4 + cva + clsx + tailwind-merge

**Tailwind v4 se configura en el CSS**, no en un archivo JS:

```css
/* src/index.css */
@theme {
  --color-surface: oklch(0.16 0.02 265);
  --color-brand: oklch(0.72 0.17 152);
  --spacing-touch: 2.75rem;
  --aspect-poster: 2 / 3;
}
```

Cada variable genera utilidades: `bg-surface`, `text-brand`, `min-h-touch`, `aspect-poster`. Los
nombres son **semánticos** («superficie», «marca»), no descriptivos («azul-900»): si mañana cambia
el color, se toca una línea.

**cva** (`class-variance-authority`) define variantes tipadas:

```tsx
// src/presentation/components/Common/Button.tsx
export const buttonVariants = cva('inline-flex min-h-touch ...', {
  variants: {
    variant: { primary: '...', secondary: '...', ghost: '...' },
    size: { sm: 'px-3 text-sm', md: 'px-4' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

`<Button variant="secundario">` no compila. Y el área táctil mínima y el foco visible están en la
**base**, así que ningún botón puede olvidarse de ellos.

**clsx + tailwind-merge**:

```ts
// src/presentation/lib/cn.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` junta clases condicionales; `twMerge` resuelve colisiones de Tailwind. Sin él,
`"px-4 px-6"` deja las dos y gana la que esté antes en el CSS —no la última que escribiste—, que
es una fuente clásica de «por qué no se aplica mi clase».

### 4.8 Virtualización con `@tanstack/react-virtual`

Con 2.000 tarjetas, pintar 2.000 nodos del DOM mata el navegador. La virtualización pinta **solo
las filas visibles**.

```tsx
// src/presentation/components/Common/MovieGrid.tsx
const virtualizer = useWindowVirtualizer({
  count: Math.ceil(movies.length / columns),
  estimateSize: () => ESTIMATED_ROW_HEIGHT,
  overscan: 2,
  scrollMargin,
});
```

- Se virtualiza **por filas**, no por tarjetas: las columnas se calculan del ancho medido con un
  `ResizeObserver`.
- `overscan: 2` pinta dos filas de más arriba y abajo, para que al hacer scroll rápido no se vea
  el hueco.
- `scrollMargin` corrige el desfase cuando la cuadrícula no empieza justo arriba del documento.
- Solo se activa a partir de 60 tarjetas: por debajo, virtualizar cuesta más de lo que ahorra.
- Se mantienen `role="list"` y `role="listitem"` para que virtualizar **no rompa la semántica**
  que un lector de pantalla necesita.

### 4.9 Vitest + Testing Library + MSW

**Testing Library busca como busca una persona**, por rol accesible y nombre:

```tsx
screen.getByRole('button', { name: 'Limpiar filtros' });
screen.getByRole('link', { name: 'El padrino, 1972, 8,7 de 10 con 20.000 votos' });
```

No hay ni un `data-testid` en el proyecto, y es a propósito: **si hace falta un id de prueba para
encontrar un botón, ese botón tampoco es accesible**. Accesibilidad y pruebas son el mismo trabajo.

**MSW** simula la red a nivel de peticiones, no de módulos:

```ts
server.use(http.get(`${TMDB}/trending/movie/week`, () => HttpResponse.json(pageDto([movieDto()]))));
```

Se prueba el camino completo —Axios, interceptores, Zod, mapeo— sin salir a internet. Y
`onUnhandledRequest: 'error'` (en `vitest.setup.ts`) hace que una petición que nadie simuló
**rompa el test** en vez de irse a la red de verdad.

**Dobles de puerto, no de librería** (`src/test/render.tsx`):

```ts
export function createFakeCatalog(overrides: Partial<CatalogPort> = {}): CatalogPort;
export function createFakeLibrary(initial: Library = EMPTY_LIBRARY): LibraryPort;
```

Las pruebas de pantalla doblan **la interfaz**, no Axios. Si mañana cambiamos de librería HTTP,
esas pruebas no se enteran.

**Tiempo controlado**: cero esperas reales.

```ts
vi.useFakeTimers({ shouldAdvanceTime: true });
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
await user.type(input, 'elpadrino');
vi.advanceTimersByTime(500); // ← el reloj lo movemos nosotros
```

Un test con `sleep(500)` es lento y, peor, inestable.

**Cobertura**: 100% en `src/domain/`, 80% global, impuesto por el gate. El dominio es puro y
barato de cubrir; si un archivo del dominio es difícil de probar, el problema es el diseño.

### 4.10 El gate: ESLint, Prettier, Husky

`scripts/verify.sh` corre formato → linter → tipos → pruebas → build. El **mismo archivo** en tu
máquina (por los hooks de Husky) y en el CI, para que no puedan separarse.

Lo interesante del `eslint.config.js` no son las reglas de estilo, sino que **la arquitectura vive
en el linter**:

```js
{
  files: ['src/domain/**/*.ts'],
  rules: { 'no-restricted-imports': ['error', { patterns: [
    { group: ['react', 'react-*', 'axios', '@tanstack/*'], message: 'El dominio no depende de frameworks.' },
  ]}]},
}
```

Una regla de arquitectura que solo vive en un diagrama se rompe el jueves. Una que vive en el
linter y en el CI, no.

---

## 5. La arquitectura: capas y puertos

### El problema que resuelve

Sin capas, un componente hace `axios.get(...)`, parsea, formatea y pinta. Funciona… hasta que
querés probarlo (necesitás red), cambiar de librería (tocás 40 archivos) o entender dónde está la
regla de negocio (en ninguna parte y en todas).

### Puertos y adaptadores

Un **puerto** es una interfaz que describe **qué** necesitás, sin decir **cómo**:

```ts
// src/application/ports/catalog-port.ts
export interface CatalogPort {
  getMovieGenres(options?: RequestOptions): Promise<readonly Genre[]>;
  discoverMovies(filters: DiscoverFilters, options?: RequestOptions): Promise<MoviePage>;
  getMovieDetail(id: number, options?: RequestOptions): Promise<MovieDetail>;
}
```

Un **adaptador** lo implementa:

```ts
// src/infrastructure/tmdb/tmdb-catalog-repository.ts
export function createTmdbCatalogRepository(now = () => new Date()): CatalogPort;
```

Fijate en `now`: **el reloj entra por parámetro**. Una política que consulta `new Date()` por
dentro no se puede probar sin trucos. Lo mismo en el dominio:

```ts
// src/domain/catalog/release-status.ts
export function releaseStatusFrom(tmdbStatus: string, releaseDate: string | null, today: Date);
```

### Dónde muere cada mentira de TMDB

```ts
// src/infrastructure/tmdb/tmdb-mappers.ts
function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}
```

Esa función es **la línea exacta** donde una cadena vacía de TMDB deja de fingir que es un dato. Y
ésta es donde muere el cero:

```ts
rating: ratingFrom(dto.vote_average, dto.vote_count), // 0 votos → { kind: 'unrated' }
budget: moneyFromTmdbAmount(dto.budget),              // 0 dólares → null
```

De ahí para dentro, **el tipo dice la verdad** y la pantalla está obligada a tratar el caso. Por
eso ves «Sin dato» y no «$0».

### La composición

```tsx
// src/main.tsx
const catalog = createTmdbCatalogRepository();
const library = createLocalLibraryRepository();

root.render(
  <QueryClientProvider client={queryClient}>
    <CatalogProvider catalog={catalog}>
      <LibraryProvider library={library}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LibraryProvider>
    </CatalogProvider>
  </QueryClientProvider>,
);
```

Este es el **único** archivo que conoce a la vez la infraestructura y la presentación. Todo lo
demás habla con interfaces.

---

## 6. Dos recorridos completos

### A. Abrís `/explorar?genero=28&anio=1999`

1. **`main.tsx`** ya montó los proveedores.
2. **`App.tsx`** empareja la ruta y `lazy` descarga el chunk de `DiscoverPage`; mientras tanto,
   `Suspense` muestra el esqueleto.
3. **`DiscoverPage`** lee `useSearchParams()` y llama a `parseDiscoverFilters`.
4. **`discover-filters-url.ts`** valida cada parámetro con Zod. `genero=28` pasa; si hubieras
   escrito `anio=abc`, cae a `null` sin romper nada.
5. **`useDiscoverMovies(filters)`** arma la clave `['catalog','discover',{genreId:28,...}]`. Si ya
   estaba en caché y fresca, se pinta al instante y no hay petición.
6. Si no, `queryFn` llama a **`catalog.discoverMovies`** (el puerto).
7. **`tmdb-catalog-repository`** traduce los filtros del dominio a los nombres de TMDB
   (`with_genres`, `primary_release_year`) y llama a `requestJson`.
8. **`tmdb-http-client`** manda la petición con credencial e idioma. Si falla, el interceptor la
   convierte en `ApiError`.
9. **Zod** valida la respuesta. Si un campo no cumple, sale un `invalidResponse` localizado.
10. **`toMoviePage`** mapea al dominio: los `''` pasan a `null`, los 0 votos a `unrated`, y
    `totalPages` se recorta a 500.
11. **`DiscoverPage`** decide entre los cuatro estados y pinta `MovieGrid`.
12. **`MovieCard`** arma un enlace con nombre accesible completo. Su póster se pide en `w342`,
    nunca en `original`, y reserva su proporción antes de cargar.

### B. Hacés clic en el corazón de una tarjeta

1. **`SaveMovieButton`** llama a `toggle.mutate(movie)`.
2. **`onMutate`** cancela las lecturas en vuelo, guarda la foto anterior y escribe en la caché la
   biblioteca **ya con la película**. El corazón se pinta lleno: 0 ms de espera.
3. **`mutationFn`** lee el estado real del `localStorage`, aplica `toggleMovie` (dominio puro) y
   escribe.
4. Si `localStorage` falla (cuota, modo privado), el adaptador rechaza con
   `ApiError({ kind: 'storageWrite' })`, **`onError`** restaura la foto anterior y el corazón
   vuelve solo a su sitio.
5. **`onSettled`** invalida `['library']`. Como la cuadrícula, la ficha y Mi cineteca leen esa
   misma clave, **las tres se actualizan a la vez**. Eso es la invalidación cruzada.

---

## 7. Preguntas para comprobar que lo entendiste

1. ¿Por qué se cancela lo que está en vuelo antes de una actualización optimista?
2. Mostrame la línea exacta donde un `0` de TMDB deja de significar cero.
3. ¿Qué se rompe si el texto del buscador entra crudo en la clave de caché?
4. ¿Por qué la fecha actual entra por parámetro en la política y no se consulta dentro?
5. Si mañana TMDB añade un estado nuevo de película, ¿qué archivo deja de compilar?
6. ¿Por qué el almacenamiento local se valida al leer, si lo escribió tu propia app?
7. ¿Qué otras vistas muestran el dato que acabás de mutar?
8. ¿Por qué los filtros viven en la URL y no en `useState`?
9. ¿Qué hace `twMerge` que `clsx` no hace?
10. ¿Por qué no hay ni un `data-testid` en el proyecto?
11. ¿Qué diferencia hay entre el idioma del **contenido** y el idioma de los **formatos**?
12. ¿Por qué `useEffect` no aparece en ningún sitio para traer datos?

Las respuestas están todas en esta guía y en el código. Si alguna no la podés contestar señalando
un archivo, ahí tenés qué repasar.
