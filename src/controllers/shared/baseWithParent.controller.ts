import type { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { EntityNotFoundError, type ObjectLiteral } from 'typeorm';
import type { BaseServiceWithParent } from 'src/services/shared/baseWithParent.service';
import type { PaginationQuery, TypedRequest } from 'src/types';
import { BaseController } from './base.controller';
import asyncHandler from 'src/middleware/async';

export abstract class BaseControllerWithParent<Entity extends ObjectLiteral> extends BaseController<Entity> {
  override service: BaseServiceWithParent<Entity>;

  get createFromParent() {
    return asyncHandler(async (req: TypedRequest<unknown>, res: Response, _: NextFunction): Promise<Response | undefined> => {
      const id = parseInt(<string>req.params['id']);

      if (!id) {
        throw new EntityNotFoundError(this.service.repository.target, {
          [this.service.parentIdField]: id
        });
      }

      const newData = req.body as Entity;

      if (!newData) {
        throw new EntityNotFoundError(this.service.repository.target, null);
      }

      const data = await this.service.createFromParent(id, newData);

      return res.status(httpStatus.CREATED).json({
        success: true,
        data
      });
    });
  }

  listFromParent(relations: string[] = []) {
    return asyncHandler(
      async (req: TypedRequest<unknown, PaginationQuery>, res: Response, _: NextFunction): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);

        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        const data = await this.service.listFromParent(id, relations);

        return res.status(httpStatus.OK).json({
          success: true,
          data
        });
      }
    );
  }

  get listFromParentPaginated() {
    return asyncHandler(
      async (req: TypedRequest<unknown, PaginationQuery>, res: Response, _: NextFunction): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);

        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const [data, total] = await this.service.listFromParentPaginated(id, skip, limit);

        return res.status(httpStatus.OK).json({
          success: true,
          data,
          total
        });
      }
    );
  }

  get updateMany() {
    return asyncHandler(
      async (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: TypedRequest<any>,
        res: Response,
        __: NextFunction
      ): Promise<Response | undefined> => {
        const items: Entity[] = req.body;

        if (!items) {
          throw new EntityNotFoundError(this.service.repository.target, {});
        }

        const data = await this.service.updateMany(items);

        return res.status(httpStatus.OK).json({
          success: true,
          data
        });
      }
    );
  }

  get deleteMany() {
    return asyncHandler(
      async (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: TypedRequest<any>,
        res: Response,
        __: NextFunction
      ): Promise<Response | undefined> => {
        const itemsNo: number[] = req.body.itemsNo;

        if (!itemsNo) {
          throw new EntityNotFoundError(this.service.repository.target, {});
        }

        await this.service.deleteMany(itemsNo);

        return res.status(httpStatus.OK).json({
          success: true,
          data: itemsNo
        });
      }
    );
  }
}
