import { buildWhereConditions } from 'src/utils/manipulateFilter';
import { deletePartialToFullEntity, updatePartialToFullEntities, updatePartialToFullEntity } from 'src/utils/database.utils';
import {
  type DeepPartial,
  type DeleteResult,
  type FindManyOptions,
  type FindOptionsOrder,
  type FindOptionsRelations,
  type FindOptionsSelect,
  type FindOptionsWhere,
  type ObjectLiteral,
  type Repository
} from 'typeorm';

export interface FilterOption {
  field: string;
  value: string | number | boolean;
  type: 'exact' | 'beginsWith' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
}

export interface AdvancedSearchOptions<Entity> {
  skip: number;
  take: number;
  filters: FilterOption[];
  orderBy?: FindOptionsOrder<Entity>;
  select?: FindOptionsSelect<Entity>;
  where?: Array<FindOptionsWhere<Entity>> | FindOptionsWhere<Entity>;
  relations?: FindOptionsRelations<Entity>;
}

export abstract class BaseService<Entity extends ObjectLiteral> {
  repository: Repository<Entity>;
  _pk: keyof Entity;

  constructor(repository: Repository<Entity>, pk: keyof Entity) {
    this.repository = repository;
    this._pk = pk;
  }

  async create(data: DeepPartial<Entity>) {
    return await this.repository.save(data);
  }

  async retrieve(id: number, relations: string[] | FindOptionsRelations<Entity> = [], select?: Array<keyof Entity>) {
    return await this.repository.findOneOrFail({
      where: {
        [this._pk]: id
      } as FindOptionsWhere<Entity>,
      relations,
      select: select as string[]
    });
  }

  async list(options?: FindManyOptions<Entity>) {
    return await this.repository.find(options);
  }

  // should be able to select specific columns and also where statement to filter the data as needed
  async listPaginated(
    skip: number,
    take: number,
    select?: Array<keyof Entity>,
    relations: string[] = [],
    whereOptions?: FindOptionsWhere<Entity> | Array<FindOptionsWhere<Entity>>
  ) {
    const findOptions: FindManyOptions<Entity> = {
      skip,
      take,
      select: select as string[],
      relations
    };

    if (whereOptions) {
      findOptions.where = whereOptions;
    }

    return await this.repository.find(findOptions);
  }

  async search(options: FindManyOptions<Entity>) {
    return await this.repository.find(options);
  }

  async save(id: number, data: Partial<Entity>) {
    const entityClass = this.repository.target as new () => Entity;
    // this will fetch the existing entity, merge changes, and save it.
    return updatePartialToFullEntity<Entity>(entityClass, id, data);
  }

  /**
   * Updates multiple entities that satisfy the provided where condition (for example
   * `{ id: In([1,2,3]) }`) by merging in the supplied partial data and then saving
   * them using `repository.save` so that all hooks/subscribers run.
   *
   * @param where  TypeORM where condition describing the set of entities to update.
   * @param data   Partial data to merge into every matched entity.
   */
  async saveWhere(where: FindOptionsWhere<Entity> | Array<FindOptionsWhere<Entity>>, data: Partial<Entity>) {
    const entityClass = this.repository.target as new () => Entity;
    return updatePartialToFullEntities<Entity>(entityClass, where, data);
  }

  async delete(id: number): Promise<DeleteResult | Entity> {
    const entityClass = this.repository.target as new () => Entity;
    // this will fetch the existing entity, delete it, and return the deleted entity.
    return deletePartialToFullEntity<Entity>(entityClass, id);
  }

  async count(whereOptions: FindOptionsWhere<Entity>): Promise<number>;
  async count(filters: FilterOption[]): Promise<number>;
  async count(arg: FindOptionsWhere<Entity> | FilterOption[]): Promise<number> {
    if (Array.isArray(arg)) {
      const whereConditions = buildWhereConditions<Entity>(arg, this.repository.metadata);
      return this.repository.count({ where: whereConditions });
    } else {
      const findOptions: FindManyOptions<Entity> = {
        where: arg
      };
      return await this.repository.count(findOptions);
    }
  }

  async smartSearch(options: AdvancedSearchOptions<Entity>) {
    const { skip, take, select, relations, filters, orderBy } = options;
    const whereConditions = buildWhereConditions<Entity>(filters, this.repository.metadata);

    const findOptions: FindManyOptions<Entity> = {
      where: whereConditions,
      skip,
      take,
      ...(select ? { select } : {}),
      ...(relations ? { relations } : {}),
      ...(orderBy ? { order: orderBy } : {})
    };

    return this.repository.findAndCount(findOptions);
  }
}
