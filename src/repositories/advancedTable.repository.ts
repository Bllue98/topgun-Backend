import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from 'src/data-source';
import { filtersByTableName, getColumnsNames, mountWhereClause } from 'src/utils/tableFilters.util';

type ApplyAccessFilters = (queryBuilder: SelectQueryBuilder<any>) => Promise<SelectQueryBuilder<any>>;

class AdvancedResultsRepository<Entity extends ObjectLiteral> {
  private readonly entity: new () => Entity;
  private readonly tableName: string;
  private readonly columns: string[];

  constructor(entity: new () => Entity) {
    this.entity = entity;

    // Get the repository to dynamically determine table name and columns
    const repository = AppDataSource.getRepository(this.entity);
    this.tableName = repository.metadata.tableName;
    this.columns = filtersByTableName[this.tableName] ?? [];

    if (!this.columns) {
      throw new Error(`No columns found for table ${this.tableName}`);
    }
  }

  async getAdvancedResults(
    queryParams: Record<string, string>,
    additionalFilter = '',
    applyAccessFilters?: ApplyAccessFilters
  ): Promise<{ data: Entity[]; total: number }> {
    const { page = '1', limit = '10', sort = 'DESC', column = this.columns[0] } = queryParams;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new Error('Invalid page or limit');
    }

    const columnsName = getColumnsNames(this.columns);

    const offset = (pageNumber - 1) * limitNumber;

    const repository = AppDataSource.getRepository(this.entity);
    let queryBuilder: SelectQueryBuilder<Entity> = repository.createQueryBuilder(this.tableName);

    queryBuilder = queryBuilder.select(this.columns.map((col) => (col.includes('.') ? col : `${this.tableName}.${col}`)));

    queryBuilder = mountWhereClause(queryBuilder, queryParams, columnsName, additionalFilter);

    if (applyAccessFilters) {
      queryBuilder = await applyAccessFilters(queryBuilder);
    }

    queryBuilder = queryBuilder
      .orderBy(column?.includes('.') ? column : `${this.tableName}.${column}`, sort.toUpperCase() as 'ASC' | 'DESC')
      .setFindOptions({
        relations: repository.metadata.relations
          .map((relation) => relation.propertyName)
          .filter((relation) => this.columns.includes(relation))
      })
      .skip(offset)
      .take(limitNumber);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }
}

export default AdvancedResultsRepository;
