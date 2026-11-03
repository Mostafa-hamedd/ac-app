import { z } from 'zod';

/** ISO-8601 date-time string as returned by the API. */
export const isoDateSchema = z.string();

/** Cursor-paginated list envelope. */
export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), nextCursor: z.string().nullable() });
}

export type Paginated<T> = { items: T[]; nextCursor: string | null };
