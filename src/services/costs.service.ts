import { CostsRepository } from '../repositories/costs.repository';
import { Cost } from '../entities/Cost';

export class CostsService {
  constructor(private repository: CostsRepository) {}

  async getAll(): Promise<Cost[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Cost> {
    return this.repository.findById(id);
  }

  async create(data: Partial<Cost>): Promise<Cost> {
    // could add validation here before saving
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Cost>): Promise<Cost> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getByKind(kind: string): Promise<Cost[]> {
    return this.repository.findByKind(kind);
  }

  async getByResource(resource: string): Promise<Cost[]> {
    return this.repository.findByResource(resource);
  }
}
