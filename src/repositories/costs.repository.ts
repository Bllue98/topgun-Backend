import { DataSource, Repository } from 'typeorm';
import { Cost } from '../entities/Cost';

/**
 * A simple NotFoundError to make missing-record cases explicit.
 */
export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class CostsRepository {
  private repo: Repository<Cost>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Cost);
  }

  /**
   * Fetch all costs
   */
  async findAll(): Promise<Cost[]> {
    return this.repo.find();
  }

  /**
   * Fetch one cost by its string ID, or throw if missing
   */
  async findById(id: string): Promise<Cost> {
    const cost = await this.repo.findOneBy({ id });
    if (!cost) throw new NotFoundError('Cost', id);
    return cost;
  }

  /**
   * Create and save a new cost
   */
  async create(costData: Partial<Cost>): Promise<Cost> {
    const cost = this.repo.create(costData);
    return this.repo.save(cost);
  }

  /**
   * Partially update an existing cost via preload + save
   */
  async update(id: string, costData: Partial<Cost>): Promise<Cost> {
    const cost = await this.repo.preload({ id, ...costData });
    if (!cost) throw new NotFoundError('Cost', id);
    return this.repo.save(cost);
  }

  /**
   * Hard-delete; throws if nothing was removed
   */
  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundError('Cost', id);
  }

  /**
   * Domain-specific lookup by kind
   */
  async findByKind(kind: string): Promise<Cost[]> {
    return this.repo.find({ where: { kind } });
  }

  /**
   * Domain-specific lookup by resource
   */
  async findByResource(resource: string): Promise<Cost[]> {
    return this.repo.find({ where: { resource } });
  }
}
