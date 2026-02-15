import { QueryFilters } from '../types/query.type';

export function normalizeQueryFilters(queryFilters: QueryFilters) {
  const dynamicWhere: Record<string, any> = {};

  for (const field in queryFilters) {
    const { value, matchMode = 'eq' } = queryFilters[field];

    if (value === undefined) continue;

    switch (matchMode) {
      case 'eq':
      case 'equals':
        dynamicWhere[field] = value;
        break;

      case 'neq':
        dynamicWhere[field] = { not: value };
        break;

      case 'gt':
        dynamicWhere[field] = { gt: value };
        break;

      case 'gte':
        dynamicWhere[field] = { gte: value };
        break;

      case 'lt':
        dynamicWhere[field] = { lt: value };
        break;

      case 'lte':
        dynamicWhere[field] = { lte: value };
        break;

      case 'between':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(`Filter "${field}" with matchMode "between" must be an array [min, max]`);
        }

        dynamicWhere[field] = {
          gte: value[0],
          lte: value[1],
        };
        break;

      case 'like':
        dynamicWhere[field] = {
          contains: value,
        };
        break;

      case 'startsWith':
        dynamicWhere[field] = {
          startsWith: value,
        };
        break;

      case 'endsWith':
        dynamicWhere[field] = {
          endsWith: value,
        };
        break;

      case 'in':
        if (!Array.isArray(value)) {
          throw new Error(`Filter "${field}" with matchMode "in" must be an array`);
        }

        dynamicWhere[field] = { in: value };
        break;

      case 'notIn':
        if (!Array.isArray(value)) {
          throw new Error(`Filter "${field}" with matchMode "notIn" must be an array`);
        }

        dynamicWhere[field] = { notIn: value };
        break;

      case 'isNull':
        dynamicWhere[field] = null;
        break;

      case 'isNotNull':
        dynamicWhere[field] = { not: null };
        break;

      default:
        throw new Error(`Unsupported matchMode "${String(matchMode)}" for field "${field}"`);
    }
  }

  return dynamicWhere;
}

export function normalizeQueryOrderBy<TOrderBy>(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc',
): TOrderBy | undefined {
  if (!sortBy) return undefined;

  /**
   * Support by relation:
   * company.name → { company: { name: 'asc' } }
   */
  if (sortBy.includes('.')) {
    const parts = sortBy.split('.');

    return parts.reverse().reduce<any>((acc, part, index) => {
      if (index === 0) return { [part]: sortOrder };
      return { [part]: acc };
    }, {});
  }

  return {
    [sortBy]: sortOrder,
  } as TOrderBy;
}
