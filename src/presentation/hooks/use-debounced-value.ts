// src/presentation/hooks/use-debounced-value.ts
import { useEffect, useState } from 'react';

/**
 * Diez letras tienen que disparar UNA petición, no diez. La espera vive acá y
 * no dentro del campo de búsqueda: así la pantalla decide cuánto esperar y la
 * prueba puede controlar el reloj.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
