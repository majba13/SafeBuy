import { PaginatedResult, PaginationOptions } from '../interfaces/pagination.interface';

/**
 * Builds a PaginatedResult from raw data + total count.
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Converts page/limit into mongoose skip/limit values.
 */
export function toSkipLimit(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    limit,
  };
}
