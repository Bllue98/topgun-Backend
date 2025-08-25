import { type DeleteResult, type FindOptionsWhere, In, type ObjectLiteral, type Repository } from 'typeorm';
import { AppDataSource } from 'src/data-source';
import { BaseService } from 'src/services/shared/base.service';

export abstract class BaseServiceWithParent<Entity extends ObjectLiteral> extends BaseService<Entity> {
  parentIdField: keyof Entity;

  constructor(repository: Repository<Entity>, pk: keyof Entity, parentIdField: keyof Entity) {
    super(repository, pk);
    this.parentIdField = parentIdField;
  }

  async createFromParent(parentId: number, data: any) {
    data[this.parentIdField] = parentId;
    return await this.repository.save(data);
  }

  async listFromParent(parentId: number, relations: string[] = []) {
    return await this.repository.find({
      where: {
        [this.parentIdField]: parentId
      } as FindOptionsWhere<Entity>,
      relations
    });
  }

  async listFromParentPaginated(parentId: number, skip: number, take: number, select?: Array<keyof Entity>) {
    return await this.repository.findAndCount({
      where: {
        [this.parentIdField]: parentId
      } as FindOptionsWhere<Entity>,
      skip,
      take,
      select: select ?? []
    });
  }

  async updateMany(items: Entity[]) {
    const currentItems = await this.repository.find({
      where: {
        [this._pk]: In(items.map((item) => item[this._pk]))
      } as FindOptionsWhere<Entity>
    });

    const updatedItems = currentItems.map((item) => {
      const newData = items.find((updatedItem) => updatedItem[this._pk] === item[this._pk]);

      if (newData) {
        return this.repository.merge(item, newData);
      }

      return item;
    });

    await this.repository.save(updatedItems);

    return updatedItems;
  }

  async deleteMany(ids: number[]) {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let data: DeleteResult[];

    try {
      const deletePromises = ids.map(async (id) => await this.repository.delete({ [this._pk]: id } as FindOptionsWhere<Entity>));

      data = await Promise.all(deletePromises);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return data;
  }
}
