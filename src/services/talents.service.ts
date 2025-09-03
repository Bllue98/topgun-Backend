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
}

export default new TalentsService(talentsRepository, 'id');
