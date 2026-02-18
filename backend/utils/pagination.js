/**
 * Pagination utilities - Industry standard for API responses
 * - Consistent format across all endpoints
 * - Validation with safe defaults
 * - Cursor-based option for large datasets
 */

/**
 * Parse and validate pagination from query params
 * @param {object} query - req.query
 * @param {object} options - { defaultLimit, maxLimit, defaultPage }
 * @returns {{ page, limit, skip, sort }}
 */
export function parsePagination(query = {}, options = {}) {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultPage = 1,
  } = options;

  const page = Math.max(1, parseInt(query.page, 10) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Parse sort params safely
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - 'asc' | 'desc'
 * @param {string[]} allowedFields - Whitelist of sortable fields
 * @returns {object} MongoDB sort object
 */
export function parseSort(sortBy = 'createdAt', sortOrder = 'desc', allowedFields = []) {
  const order = sortOrder?.toLowerCase() === 'asc' ? 1 : -1;
  const field = allowedFields.length && !allowedFields.includes(sortBy) ? 'createdAt' : (sortBy || 'createdAt');
  return { [field]: order };
}

/**
 * Build standard pagination response metadata
 * @param {number} total - Total documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export function paginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Standard paginated response format
 * @param {any[]} data - Array of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export function paginatedResponse(data, total, page, limit) {
  return {
    success: true,
    data,
    pagination: paginationMeta(total, page, limit),
  };
}

/**
 * Express middleware - attach parsed pagination to req.pagination
 * @param {object} options - parsePagination options
 */
export function paginationMiddleware(options = {}) {
  return (req, _res, next) => {
    req.pagination = parsePagination(req.query, options);
    req.paginationSort = parseSort(
      req.query.sortBy,
      req.query.sortOrder,
      options.allowedSortFields || []
    );
    next();
  };
}

export default {
  parsePagination,
  parseSort,
  paginationMeta,
  paginatedResponse,
  paginationMiddleware,
};
