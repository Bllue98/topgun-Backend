import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

export const filtersByTableName: Record<string, string[]> = {
  users: ['id', 'name', 'email'],
  costs: ['id', 'kind', 'resource', 'amount', 'maxUses'],
  effects: ['id', 'kind', 'durationType', 'durationAmount', 'data'],
  rarities: ['id', 'tier', 'weight', 'color'],
  requirements: ['id', 'kind', 'minLevel', 'stat', 'minValue', 'talentRefId', 'tag', 'tagCount', 'classId', 'talents'],
  tags: ['id', 'tag'],
  talents: [
    'id',
    'name',
    'description',
    'createdAt',
    'updatedAt',
    'isKeyTalent',
    'category',
    'cooldown',
    'rank',
    'maxRank',
    'rarityId',
    // relations
    'rarity',
    'tags',
    'costs',
    'effects',
    'requirements'
  ]
};

export const searchTemplates = {
  beginsWith: (value: string) => `${value}%`,
  contains: (value: string) => `%${value}%`,
  exactMatch: (value: string) => value
} as const;

export const getSearchTemplateFunction = (
  query: Record<string, string>,
  defaultTemplate: keyof typeof searchTemplates = 'contains'
) => {
  // eslint-disable-next-line security/detect-object-injection
  let searchTemplateFunction = searchTemplates[defaultTemplate];

  if ('searchType' in query && query['searchType'] in searchTemplates) {
    const searchTemplate = query['searchType'] as keyof typeof searchTemplates;

    // eslint-disable-next-line security/detect-object-injection
    searchTemplateFunction = searchTemplates[searchTemplate] ?? searchTemplates[defaultTemplate];
  }

  return searchTemplateFunction;
};

export const mountWhereClause = <Entity extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<Entity>,
  query: Record<string, string>,
  filters: string[],
  additionalFilter: string
): SelectQueryBuilder<Entity> => {
  const searchTemplateFunction = getSearchTemplateFunction(query);
  const filterZeros = 'filterZeros' in query && query['filterZeros'] === 'true';
  const ignoreDashes = 'ignoreDashes' in query && query['ignoreDashes'] === 'true';

  filters.forEach((filter, index) => {
    // eslint-disable-next-line security/detect-object-injection
    const isDateFilter = /Date/i.test(filter);

    if (isDateFilter) {
      queryBuilder = mountDateFilter(queryBuilder, query, filter);

      return;
    }

    let value = query[filter.toString()];
    if (value && value !== '' && value !== 'null') {
      if (filterZeros) {
        value = value.replace(/(0|O)/gi, '%');
      }

      if (ignoreDashes) {
        value = value.replace(/-/gi, '%');
      }

      const { condition, parameters } = getConditionAndParameters(value, filter, index, searchTemplateFunction);

      queryBuilder = queryBuilder.andWhere(condition, parameters);
    }
  });

  if (additionalFilter) {
    queryBuilder = queryBuilder.andWhere(additionalFilter);
  }

  return queryBuilder;
};

export const mountDateFilter = <Entity extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<Entity>,
  query: Record<string, string>,
  filter: string
) => {
  const startDateValue = query[`${filter}Start`];
  const endDateValue = query[`${filter}End`];

  const startDateCondition = `${filter} >= :startDate`;
  const endDateCondition = `${filter} <= :endDate`;

  if (startDateValue) {
    queryBuilder = queryBuilder.andWhere(startDateCondition, { startDate: startDateValue });
  }

  if (endDateValue) {
    queryBuilder = queryBuilder.andWhere(endDateCondition, { endDate: endDateValue });
  }

  return queryBuilder;
};

export const getConditionAndParameters = (
  value: string,
  filter: string,
  index: number,
  searchTemplateFunction: ReturnType<typeof getSearchTemplateFunction>
) => {
  // Determine if the value should be treated as a boolean, a number, or a string for SQL querying
  const valueIsBoolean = /^(false|true)$/i.test(value);
  const valueIsNumber = !isNaN(parseFloat(value)) && isFinite(Number(value));
  const isPositiveNumber = valueIsNumber && parseFloat(value) > 0;
  const endsWithNoOrId = /No$|Id$/i.test(filter);

  let condition = `${filter} = :value${index}`;
  let parameters: Record<string, string | number>;

  if (valueIsBoolean) {
    const normalized = value.toLowerCase() === 'true' ? 'T' : 'F';
    parameters = { [`value${index}`]: normalized };
  } else if (valueIsNumber && endsWithNoOrId && isPositiveNumber) {
    parameters = { [`value${index}`]: value };
  } else {
    // For strings and true booleans that don't end with "No" or "Id"
    condition = `${filter} LIKE :value${index}`;
    parameters = { [`value${index}`]: searchTemplateFunction(value) };
  }

  return { condition, parameters };
};

export const getColumnsNames = (columns: string[]) => {
  return columns.map((column) => column.split(' ')[0] ?? null).filter(Boolean) as string[];
};

export const getColumnsAliases = (columns: string[]) => {
  return columns.map((column) => column.split(' ').pop() ?? null).filter(Boolean) as string[];
};
