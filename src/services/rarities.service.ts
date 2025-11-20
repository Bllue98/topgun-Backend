import type { Rarity } from 'src/entities/Rarity';
import raritiesRepository from 'src/repositories/rarities.repository';
import { BaseService } from 'src/services/shared/base.service';

export class RaritiesService extends BaseService<Rarity> {
  async listAllSortedByWeightDesc() {
    return this.repository.find({ order: { weight: 'DESC' } });
  }

  async reorderByIndex(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return this.listAllSortedByWeightDesc();
    const all = await this.listAllSortedByWeightDesc();
    const n = all.length;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= n || toIndex >= n) {
      throw new Error('Invalid index');
    }
    // Swap weights to reflect new order while preserving multiset of weights
    const a = all.find((_, i) => i === fromIndex);
    const b = all.find((_, i) => i === toIndex);
    if (!a || !b) throw new Error('Invalid index');
    const temp = a.weight ?? 0;
    a.weight = b.weight ?? 0;
    b.weight = temp;
    await this.repository.save([a, b]);
    return this.listAllSortedByWeightDesc();
  }
}

export default new RaritiesService(raritiesRepository, 'id');
