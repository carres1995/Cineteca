// src/application/ports/library-port.ts
import type { Library } from '@/domain/library/library';

/**
 * "Algo que guarda la biblioteca". No dice `localStorage` en ninguna parte: por
 * eso las pruebas doblan esto y pueden simular una escritura que falla sin
 * pelearse con el navegador.
 */
export interface LibraryPort {
  load(): Promise<Library>;
  save(library: Library): Promise<void>;
}
