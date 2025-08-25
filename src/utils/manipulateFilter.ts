/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FindOptionsWhere, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, type ObjectLiteral } from 'typeorm';
import { type FilterOption } from 'src/services/shared/base.service';
import { getWhereClauseWithFullTextCheck } from 'src/utils/database.utils';

export function buildWhereConditions<Entity extends ObjectLiteral>(
  filters: FilterOption[],
  metadata: any
): FindOptionsWhere<Entity> {
  const whereConditions: FindOptionsWhere<Entity> = {};
  const validFields = metadata.columns.map((col: any) => col.propertyName);

  for (const filter of filters) {
    const { field, value, type } = filter;

    if (!field || value == null || !validFields.includes(field)) continue;

    switch (type) {
      case 'exact':
        whereConditions[field as keyof Entity] = getWhereClauseWithFullTextCheck(metadata, field, `${value}`) as any;
        break;
      case 'beginsWith':
        whereConditions[field as keyof Entity] = getWhereClauseWithFullTextCheck(metadata, field, `${value}*`) as any;
        break;
      case 'contains':
        whereConditions[field as keyof Entity] = getWhereClauseWithFullTextCheck(metadata, field, `*${value}*`) as any;
        break;
      case 'gt':
        whereConditions[field as keyof Entity] = MoreThan(value) as any;
        break;
      case 'lt':
        whereConditions[field as keyof Entity] = LessThan(value) as any;
        break;
      case 'gte':
        whereConditions[field as keyof Entity] = MoreThanOrEqual(value) as any;
        break;
      case 'lte':
        whereConditions[field as keyof Entity] = LessThanOrEqual(value) as any;
        break;
    }
  }

  return whereConditions;
}

export function parseQueryParamsToFilters(query: Record<string, string>): FilterOption[] {
  const filters: FilterOption[] = [];
  const allowedTypes: Array<FilterOption['type']> = ['exact', 'beginsWith', 'contains', 'gt', 'lt', 'gte', 'lte'];

  // Use beginsWith as the default
  const searchType: FilterOption['type'] = allowedTypes.includes(query['searchType'] as FilterOption['type'])
    ? (query['searchType'] as FilterOption['type'])
    : 'beginsWith';

  for (const [key, value] of Object.entries(query)) {
    if (!value || key === 'searchType') continue;

    filters.push({
      field: key,
      value,
      type: searchType
    });
  }

  return filters;
}
