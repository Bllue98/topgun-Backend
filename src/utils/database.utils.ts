import merge from 'lodash/merge';
import omit from 'lodash/omit';
import {
  type EntityMetadata,
  type FindOptionsOrder,
  type FindOptionsWhere,
  type ObjectLiteral,
  Raw,
  type Repository
} from 'typeorm';
import { AppDataSource } from 'src/data-source';

/**
 * Updates an entity with partial data and ensures fetch full entity before for logging purposes.
 * @param entityClass The class of the entity to update.
 * @param primaryKeyValue The identifier of the entity to update.
 * @param updateEntity The partial data to update the entity with.
 * @returns The updated entity.
 */
export async function updatePartialToFullEntity<T>(
  entityClass: new () => T,
  primaryKeyValue: number | string,
  updateEntity: Partial<T>
): Promise<T> {
  const repository = AppDataSource.getRepository(entityClass);
  const metadata = repository.metadata;
  const primaryColumns = metadata.primaryColumns;
  if (!primaryColumns || primaryColumns.length === 0) {
    throw new Error('No primary key found for the entity.');
  }
  const primaryKeyColumn = primaryColumns[0]?.propertyName;
  if (!primaryKeyColumn) {
    throw new Error('Primary key column name not found.');
  }
  const findCondition = { [primaryKeyColumn]: primaryKeyValue };
  const existingEntity = await repository.findOneByOrFail(findCondition);
  const updatedEntity = repository.merge(existingEntity, updateEntity);
  await repository.save(updatedEntity);

  return updatedEntity as T;
}

/**
 * Updates multiple entities that match the given where condition with partial data and
 * returns the updated entities. This is similar to `updatePartialToFullEntity` but works
 * on a set of records. Internally the entities are first loaded so that hooks/subscribers
 * that rely on entity data will still fire when `repository.save` is called.
 *
 * @param entityClass   The class of the entity to update.
 * @param where         The where clause describing which entities to update.
 * @param updateEntity  The partial data to merge into every matched entity.
 */
// eslint-disable-next-line @typescript-eslint/array-type
export async function updatePartialToFullEntities<T>(
  entityClass: new () => T,
  where: FindOptionsWhere<T> | Array<FindOptionsWhere<T>>,
  updateEntity: Partial<T>
  // eslint-disable-next-line @typescript-eslint/array-type
): Promise<Array<T>> {
  const repository = AppDataSource.getRepository(entityClass);

  // 1. Load all entities that match the where condition so we have real instances
  const entities = await repository.find({ where });
  if (entities.length === 0) return [];

  // 2. Merge the provided partial update into each entity instance
  // eslint-disable-next-line @typescript-eslint/array-type
  const updatedEntities = entities.map((entity) => repository.merge(entity, updateEntity)) as Array<T>;

  // 3. Persist all changes; this will also fire any subscribers/listeners
  await repository.save(updatedEntities);

  return updatedEntities;
}

/**
 * Deletes an entity based on the primary key value and ensures fetch full entity before for logging purposes.
 * @param entityClass The class of the entity to delete.
 * @param primaryKeyValue The identifier of the entity to delete.
 * @returns The deleted entity.
 */
export async function deletePartialToFullEntity<T>(entityClass: new () => T, primaryKeyValue: number | string): Promise<T> {
  const repository = AppDataSource.getRepository(entityClass);
  const metadata = repository.metadata;
  const primaryColumns = metadata.primaryColumns;
  if (!primaryColumns || primaryColumns.length === 0) {
    throw new Error('No primary key found for the entity.');
  }
  const primaryKeyColumn = primaryColumns[0]?.propertyName;
  if (!primaryKeyColumn) {
    throw new Error('Primary key column name not found.');
  }
  const findCondition = { [primaryKeyColumn]: primaryKeyValue };
  const existingEntity = await repository.findOneByOrFail(findCondition);
  await repository.remove(existingEntity);
  return existingEntity as T;
}

function formatValues(values: Array<string | number>) {
  return values.map((value) => `(${value})`).join(',');
}

export function Max(...values: Array<string | number>) {
  return `
    (SELECT MAX (v) FROM (VALUES ${formatValues(values)}) as Value(v))
  `;
}

export function Min(...values: Array<string | number>) {
  return `
    (SELECT MIN (v) FROM (VALUES ${formatValues(values)}) as Value(v))
  `;
}

export function getWhereClauseWithFullTextCheck(_metadata: EntityMetadata, _columnName: string, searchValue: string) {
  return Raw((alias) => `CONTAINS(${alias}, :searchValue)`, {
    searchValue: `"${searchValue}"`
  });
}

export function inheritEqualsExcept(target: ObjectLiteral, source: ObjectLiteral, except: string[]) {
  return merge(target, omit(source, except));
}

export function inheritEquals<DestinationEntity extends ObjectLiteral>(
  source: ObjectLiteral,
  destination: DestinationEntity,
  destinationRepository: Repository<DestinationEntity>,
  override = false,
  excludeFields: string[] = []
): DestinationEntity {
  const primaryKeys = destinationRepository.metadata.primaryColumns.map((col) => col.propertyName);
  const fieldsToExclude = Array.from(new Set([...excludeFields, ...primaryKeys]));

  const destinationFields = destinationRepository.metadata.ownColumns
    .map((column) => column.propertyName)
    .filter((field) => !fieldsToExclude.includes(field));

  for (const field of destinationFields) {
    // eslint-disable-next-line security/detect-object-injection
    if (field in source && (source[field] !== (destination as any)[field] || override)) {
      // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-explicit-any
      (destination as any)[field] = source[field];
    }
  }

  return destination;
}

/**
 * Retrieves the next available line number for an entity based on a parent field.
 * This is useful for modules like rma lines, quote lines, po lines, etc.
 *
 * @param repository The repository for the entity.
 * @param parentField The field that references the parent entity.
 * @param parentValue The value of the parent field.
 * @param lineNumberField The field that stores the line number (defaults to "lineNumber").
 * @returns A promise that resolves to the next line number.
 */
export async function getNextLineNumber<
  Entity extends ObjectLiteral,
  ParentField extends keyof Entity,
  LineNumberKey extends keyof Entity
>(
  repository: Repository<Entity>,
  parentField: ParentField,
  parentValue: Entity[ParentField],
  lineNumberField?: LineNumberKey
): Promise<number> {
  const actualLineNumberField = (lineNumberField ?? 'lineNumber') as LineNumberKey;

  // Build the "where" condition
  const condition: FindOptionsWhere<Entity> = {
    [parentField]: parentValue
  } as unknown as FindOptionsWhere<Entity>;

  // Create an order object and cast it to the correct type
  const orderClause = {
    [actualLineNumberField]: 'DESC'
  } as unknown as FindOptionsOrder<Entity>;

  const lastItem = await repository.findOne({
    where: condition,
    order: orderClause
  });

  const currentLineNumber =
    lastItem && typeof lastItem[actualLineNumberField] === 'number' ? (lastItem[actualLineNumberField] as number) : 0;

  return currentLineNumber + 1;
}
