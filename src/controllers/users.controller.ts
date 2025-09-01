import usersService from 'src/services/users.service';
import { BaseController } from 'src/controllers/shared/base.controller';
import type { User } from 'src/entities/User';
import asyncHandler from 'src/middleware/async';
import { PaginationQuery, TypedRequest } from 'src/types';
import type { NextFunction, Response } from 'express';
import ErrorResponse from 'src/middleware/error';
import httpStatus from 'http-status';
import { EntityNotFoundError } from 'typeorm';

class UserController extends BaseController<User> {
  override service: typeof usersService;

  get getActiveUsers() {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>, PaginationQuery>, res: Response, next: NextFunction): Promise<void> => {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        try {
          const users = await this.service.getActiveUsers(skip, limit);

          res.status(httpStatus.OK).json({
            success: true,
            data: users
          });
        } catch (err) {
          next(new ErrorResponse('Failed to fetch active users', httpStatus.INTERNAL_SERVER_ERROR));
        }
      }
    );
  }

  get getOne() {
    return asyncHandler(
      async (req: TypedRequest<Record<string, unknown>>, res: Response, _: NextFunction): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);

        if (!id) {
          throw new EntityNotFoundError(this.service.repository.target, {
            [this.service._pk]: id
          });
        }

        const data = await this.service.retrieve(id);

        return res.status(httpStatus.OK).json({
          success: true,
          data
        });
      }
    );
  }
}

export default new UserController(usersService);
