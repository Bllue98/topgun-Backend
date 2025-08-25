import type { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { EntityNotFoundError, type FindOptionsRelations, type ObjectLiteral } from 'typeorm';
import asyncHandler from 'src/middleware/async';
import type { BaseService } from 'src/services/shared/base.service';
import type { PaginationQuery, TypedRequest } from 'src/types';
import advancedResults from 'src/middleware/advancedResults';

export abstract class BaseController<Entity extends ObjectLiteral> {
  service: BaseService<Entity>;
  additionalFilter?: string;

  constructor(service: BaseService<Entity>, additionalFilter = '') {
    this.service = service;
    this.additionalFilter = additionalFilter;
  }

  get create() {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>>, res: Response, next: NextFunction): Promise<Response | undefined> => {
        const newData = req.body as unknown as Entity;

        if (!newData) {
          next(new EntityNotFoundError(this.service.repository.target, null));
          return;
        }

        const data = await this.service.create(newData);

        res.status(httpStatus.CREATED).json({
          success: true,
          data
        });
      }
    );
  }

  retrieve(relations: string[] | FindOptionsRelations<Entity> = []) {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>>, res: Response, _: NextFunction): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);
        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        const data = await this.service.retrieve(id, relations);

        return res.status(httpStatus.OK).json({
          success: true,
          data
        });
      }
    );
  }

  get listPaginated() {
    return async (req: TypedRequest<unknown, PaginationQuery>, res: Response, _: NextFunction): Promise<Response | undefined> => {
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;

      const data = await this.service.listPaginated(skip, limit);

      return res.status(httpStatus.OK).json({
        success: true,
        data
      });
    };
  }

  get save() {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>>, res: Response, _: NextFunction): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);
        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        const data = await this.service.save(id, req.body as Entity);

        return res.status(httpStatus.OK).json({
          success: true,
          data
        });
      }
    );
  }

  get delete() {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>>, res: Response, _: NextFunction): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);
        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        await this.service.delete(id);

        return res.status(httpStatus.OK).json({
          success: true,
          data: {}
        });
      }
    );
  }

  get search() {
    const entity = this.service.repository.target as new () => Entity;

    return advancedResults(entity);
  }
}
