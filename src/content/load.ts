import type { Content } from './types';
import { validateContent } from './validate';

export async function loadContent(signal?: AbortSignal): Promise<Content> {
  let response: Response;
  try {
    response = await fetch('/config/app-content.json', { cache: 'no-store', signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('No pudimos leer /config/app-content.json. Revisá la conexión y que el archivo esté disponible.');
  }
  if (!response.ok) throw new Error(`No se encontró el contenido en /config/app-content.json (código ${response.status}). Revisá el archivo publicado.`);
  let input: unknown;
  try {
    input = await response.json();
  } catch {
    throw new Error('El archivo /config/app-content.json no tiene un formato JSON válido. Revisá comas y comillas.');
  }
  return validateContent(input);
}
