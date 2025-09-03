// src/services/talents.service.ts
import type { Talent } from 'src/entities/Talent';
import talentsRepository from 'src/repositories/talents.repository';
import { BaseService } from 'src/services/shared/base.service';

class TalentsService extends BaseService<Talent> {
  override repository: typeof talentsRepository;

  // Retrive a talent by ID
  override async retrieve(id: number, relations: string[] = [], select?: Array<keyof Talent>): Promise<Talent> {
    const talent = await this.repository.findOne({
      where: { id },
      relations,
      ...(select ? { select } : {})
    });

    if (!talent) {
      throw new Error(`Talent with id ${id} not found`);
    }

    return talent;
  }

  // get a talent by rarity
  async getTalentsByRarity(rarityId: number, skip = 0, take = 10) {
    const [talents, total] = await this.repository.findAndCount({
      where: { rarity: { id: rarityId } },
      skip,
      take,
      order: { id: 'ASC' }
    });

    return {
      total,
      data: talents
    };
  }

  async findMany(filters: Record<string, unknown>, relations: string[] = []) {
    return this.repository.find({
      where: filters,
      relations
    });
  }

  async getRandom(filters?: { rarityId?: string; kind?: string }): Promise<Talent | null> {
    const qb = this.repository.createQueryBuilder('talent').select('talent.id');

    if (filters?.kind) {
      qb.innerJoin('talent.requirements', 'requirement', 'requirement.kind = :kind', { kind: filters.kind });
    }

    if (filters?.rarityId) {
      qb.andWhere('talent.rarityId = :rarityId', { rarityId: filters.rarityId });
    }

    qb.orderBy('NEWID()'); // random order
    qb.take(1);

    // Get the single random ID
    const result = await qb.getRawOne<{ talent_id: number }>();
    if (!result) return null;

    // Fetch full talent with relations
    return this.repository.findOne({
      where: { id: result.talent_id },
      relations: ['requirements', 'rarity', 'costs', 'effects', 'tags']
    });
  }
}

export default new TalentsService(talentsRepository, 'id');
