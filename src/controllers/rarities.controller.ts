import { BaseController } from 'src/controllers/shared/base.controller';
import type { Rarity } from 'src/entities/Rarity';
import raritiesService from 'src/services/rarities.service';
import asyncHandler from 'src/middleware/async';
import httpStatus from 'http-status';

export class RaritiesController extends BaseController<Rarity> {
  reorder = asyncHandler(async (req, res) => {
    const { fromIndex, toIndex } = req.body as { fromIndex: number; toIndex: number };
    const data = await raritiesService.reorderByIndex(Number(fromIndex), Number(toIndex));
    return res.status(httpStatus.OK).json({ success: true, data });
  });
}

export default new RaritiesController(raritiesService);
