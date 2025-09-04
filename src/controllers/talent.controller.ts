// src/controllers/talents.controller.ts
import talentsService from 'src/services/talents.service';
import { BaseController } from 'src/controllers/shared/base.controller';
import type { Talent } from 'src/entities/Talent';
import asyncHandler from 'src/middleware/async';
import { TypedRequest } from 'src/types';
import type { Response, NextFunction } from 'express';
import ErrorResponse from 'src/middleware/error';
import httpStatus from 'http-status';

import { EntityNotFoundError } from 'typeorm';

class TalentController extends BaseController<Talent> {
  override service: typeof talentsService;

  get getFull() {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>>, res: Response, next: NextFunction): Promise<Response | void> => {
        const id = parseInt(<string>req.params['id']);

        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        try {
          const talent = await this.service.retrieve(id, ['costs', 'effects', 'requirements', 'tags', 'rarity']);

          if (!talent) {
            throw new ErrorResponse('Talent not found', httpStatus.NOT_FOUND);
          }

          return res.status(httpStatus.OK).json({
            success: true,
            data: talent
          });
        } catch (err) {
          console.error('getFull error:', err);
          next(new ErrorResponse('Failed to fetch full talent', httpStatus.INTERNAL_SERVER_ERROR));
        }
      }
    );
  }

  get getRandom() {
    return asyncHandler(async (req: TypedRequest<Record<string, unknown>>, res, next) => {
      try {
        const filters: { rarityId?: string; kind?: string } = {};

        if (req.query['rarity']) {
          filters.rarityId = String(req.query['rarity']);
        }
        if (req.query['kind']) {
          filters.kind = String(req.query['kind']);
        }

        // Call service with filters
        const talent = await this.service.getRandom(filters);

        if (!talent) {
          return res.status(404).json({
            success: false,
            message: 'No talent found matching the filters'
          });
        }

        return res.status(200).json({
          success: true,
          data: talent
        });
      } catch (err) {
        console.error('getRandom error:', err);
        next(new ErrorResponse('Failed to fetch random talent', httpStatus.INTERNAL_SERVER_ERROR));
      }
    });
  }
}

export default new TalentController(talentsService);
