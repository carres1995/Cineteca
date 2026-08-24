// src/presentation/i18n/messages.ts
import { isApiError, type ApiErrorDetail } from '@/domain/errors/api-error';
import type { Rating } from '@/domain/catalog/rating';
import { formatCount, formatRating } from '@/domain/format/number-format';
import { LIST_NAME_MAX_LENGTH } from '@/domain/library/library';

/** El plural correcto lo decide Intl, no un `if` escrito a mano. */
const voteRules = new Intl.PluralRules('es-ES');
const listRules = new Intl.PluralRules('es-ES');

/**
 * El texto que ve el usuario vive acá. Ninguna cadena visible se escribe suelta
 * dentro de un componente: así se traduce, se revisa y se prueba en un solo sitio.
 */
export const messages = {
  appName: 'Cineteca',
  tagline: 'Descubrí cine y armá tu biblioteca',
  attribution: 'Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.',
  skipToContent: 'Saltar al contenido',

  nav: {
    home: 'Inicio',
    discover: 'Explorar',
    search: 'Buscar',
    library: 'Mi cineteca',
  },

  pages: {
    home: 'Inicio',
    homeTitle: 'Tendencias de la semana',
    discover: 'Explorar',
    discoverTitle: 'Explorar el catálogo',
    search: 'Buscar',
    searchTitle: 'Buscar películas',
    notFoundTitle: 'Esta página no existe',
    notFoundBody: 'El enlace que seguiste no lleva a ninguna parte.',
    backHome: 'Volver al inicio',
  },

  card: {
    /** Una tarjeta es UN enlace con nombre accesible completo. */
    accessibleName: (title: string, year: number | null, rating: Rating) => {
      const yearPart = year === null ? 'sin fecha de estreno' : String(year);
      const ratingPart =
        rating.kind === 'unrated'
          ? 'sin valoraciones'
          : `${formatRating(rating.average, 'es-ES')} de 10 con ${formatCount(rating.voteCount, 'es-ES')} ${voteRules.select(rating.voteCount) === 'one' ? 'voto' : 'votos'}`;

      return `${title}, ${yearPart}, ${ratingPart}`;
    },
  },

  status: {
    released: 'Estrenada',
    upcoming: 'Sin estrenar',
    canceled: 'Cancelada',
    unknown: 'Estado desconocido',
  },

  detail: {
    originalTitle: 'Título original',
    synopsis: 'Sinopsis',
    noSynopsis: 'Todavía no hay sinopsis para esta película.',
    synopsisFallback: (language: string) =>
      `No hay sinopsis en español. Te mostramos la versión en ${language}.`,
    runtime: 'Duración',
    budget: 'Presupuesto',
    revenue: 'Recaudación',
    genres: 'Géneros',
    releaseDate: 'Estreno',
    noData: 'Sin dato',
    cast: 'Elenco',
    noCast: 'TMDB no tiene el elenco de esta película.',
    trailer: 'Ver tráiler',
    recommendations: 'También te puede gustar',
    noRecommendations: 'No tenemos recomendaciones para esta película.',
    backToResults: 'Volver',
  },

  filters: {
    title: 'Filtros',
    genre: 'Género',
    year: 'Año de estreno',
    minimumScore: 'Nota mínima',
    minimumVotes: 'Votos mínimos',
    sortBy: 'Ordenar por',
    all: 'Todos',
    any: 'Cualquiera',
    clear: 'Limpiar filtros',
    sort: {
      'popularity.desc': 'Más populares',
      'vote_average.desc': 'Mejor valoradas',
      'primary_release_date.desc': 'Más recientes',
      'revenue.desc': 'Más taquilleras',
    },
  },

  search: {
    label: 'Buscar películas por título',
    placeholder: 'Escribí un título…',
    idle: 'Escribí algo para empezar a buscar.',
    noResults: (query: string) => `No encontramos nada para “${query}”.`,
    resultCount: (count: number) =>
      `${formatCount(count, 'es-ES')} ${voteRules.select(count) === 'one' ? 'resultado' : 'resultados'}`,
  },

  pagination: {
    loadMore: 'Cargar más',
    loading: 'Cargando…',
    end: 'Llegaste al final de los resultados.',
    apiLimit: 'TMDB no entrega más allá de las 500 páginas: este es el final del catálogo.',
    pageOf: (page: number, total: number) => `Página ${String(page)} de ${String(total)}`,
  },

  library: {
    title: 'Mi cineteca',
    saved: 'Películas guardadas',
    emptyTitle: 'Tu cineteca está vacía',
    emptyBody: 'Guardá películas mientras explorás y van a aparecer acá.',
    save: (title: string) => `Guardar ${title} en mi cineteca`,
    remove: (title: string) => `Quitar ${title} de mi cineteca`,
    saved_: 'Guardada',
    count: (count: number) =>
      `${formatCount(count, 'es-ES')} ${listRules.select(count) === 'one' ? 'película' : 'películas'}`,
  },

  lists: {
    title: 'Mis listas',
    empty: 'Todavía no creaste ninguna lista.',
    create: 'Crear lista',
    creating: 'Creando…',
    name: 'Nombre de la lista',
    rename: 'Guardar nombre',
    delete: 'Borrar lista',
    deleteConfirm: (name: string) => `Borrar la lista ${name}`,
    open: 'Ver lista',
    notFoundTitle: 'Esa lista no existe',
    notFoundBody: 'Puede que la hayas borrado, o que el enlace esté mal.',
    emptyList: 'Esta lista todavía no tiene películas.',
    addFrom: 'Agregalas desde tu cineteca.',
    addToList: (title: string) => `Agregar ${title} a la lista`,
    removeFromList: (title: string) => `Quitar ${title} de la lista`,
    problems: {
      empty: 'Poné un nombre a la lista.',
      tooLong: `El nombre no puede pasar de ${String(LIST_NAME_MAX_LENGTH)} caracteres.`,
      duplicated: 'Ya tenés una lista con ese nombre.',
    },
  },

  states: {
    loading: 'Cargando películas…',
    retry: 'Reintentar',
    emptyTrending: 'TMDB no devolvió tendencias esta semana.',
    emptyByFilter: 'Ninguna película coincide con estos filtros.',
    emptyByFilterAction: 'Probá quitando alguno.',
    noRating: 'Sin valoraciones',
    provisionalRating: 'Pocas valoraciones',
    noYear: 'Sin fecha de estreno',
    noPoster: 'Sin póster',
    votes: (count: number) => (voteRules.select(count) === 'one' ? 'voto' : 'votos'),
  },

  config: {
    missingTitle: 'Falta configurar la credencial de TMDB',
    missingHint:
      'Copiá .env.template a .env y poné tu credencial de TMDB en VITE_TMDB_READ_TOKEN: sirve tanto el API Read Access Token (v4) como la API Key (v3). Después reiniciá el servidor de desarrollo.',
  },
} as const;

/** Lenguaje llano, no códigos. El `switch` lo cubre el compilador. */
export function apiErrorMessage(detail: ApiErrorDetail): string {
  switch (detail.kind) {
    case 'network':
      return 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.';
    case 'timeout':
      return 'La respuesta tardó demasiado. Probá otra vez.';
    case 'canceled':
      return 'Cancelamos la consulta anterior.';
    case 'unauthorized':
      return 'La credencial de TMDB no es válida. Revisá el token en tu archivo .env.';
    case 'notFound':
      return 'No encontramos lo que buscabas.';
    case 'invalidRequest':
      return `La consulta no es válida: ${detail.detail}`;
    case 'rateLimited':
      return `Vamos demasiado rápido. Reintentando en ${String(Math.ceil(detail.retryAfterMs / 1000))} s.`;
    case 'server':
      return 'TMDB está teniendo problemas. Volvé a intentar en un momento.';
    case 'invalidResponse':
      return 'TMDB respondió algo que no entendemos. Ya lo estamos viendo.';
    case 'storageWrite':
      return 'No pudimos guardar en este navegador. Revisá el espacio disponible o el modo privado.';
    case 'unknown':
      return 'Algo salió mal. Intentá de nuevo.';
  }
}

/** Cualquier error que llegue a una pantalla pasa por acá antes de leerse. */
export function errorMessage(error: unknown): string {
  return isApiError(error) ? apiErrorMessage(error.detail) : apiErrorMessage({ kind: 'unknown' });
}
