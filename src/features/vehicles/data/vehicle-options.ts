/**
 * FICTIONAL MOCK DATA: a short list of makes and models to choose from while there is no
 * backend. Replace with the catalog from the API.
 */
export const MODELS_BY_MAKE: Readonly<Record<string, readonly string[]>> = {
  Opel: ['Astra', 'Corsa', 'Mokka', 'Insignia', 'Optra'],
  Toyota: ['Corolla', 'Camry', 'Yaris', 'RAV4', 'Hilux'],
  Honda: ['Civic', 'Accord', 'CR-V', 'City'],
  Ford: ['Focus', 'Fiesta', 'Explorer', 'F-150'],
  Hyundai: ['Elantra', 'Tucson', 'Accent', 'Sonata'],
  Kia: ['Cerato', 'Sportage', 'Rio', 'Sorento'],
};

export const MAKES: readonly string[] = Object.keys(MODELS_BY_MAKE);

const OLDEST_YEAR = 1990;

/** Model years from `currentYear` back to 1990, newest first. */
export function modelYears(currentYear: number): number[] {
  return Array.from({ length: currentYear - OLDEST_YEAR + 1 }, (_, i) => currentYear - i);
}
