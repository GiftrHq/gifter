import { z } from 'zod';

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().default('20').transform(Number).pipe(z.number().min(1).max(100)),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export function createPaginatedResponse<T>(
  data: T[],
  limit: number,
  getCursor: (item: T) => string
): PaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? getCursor(items[items.length - 1]) : undefined;

  return {
    data: items,
    nextCursor,
    hasMore,
  };
}
