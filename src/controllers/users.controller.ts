import usersService from 'src/services/users.service';
import { BaseController } from 'src/controllers/shared/base.controller';
import type { User } from 'src/entities/User';
import asyncHandler from 'src/middleware/async';
import { PaginationQuery, TypedRequest } from 'src/types';
import type { NextFunction, Response } from 'express';
import ErrorResponse from 'src/middleware/error';
import httpStatus from 'http-status';

class UserController extends BaseController<User> {
  override service: typeof usersService;
  get getActiveUsers() {
    return asyncHandler(
      async (
        req: TypedRequest<Record<string, unknown>, PaginationQuery>,
        res: Response,
        next: NextFunction
      ): Promise<Response | undefined> => {
        const id = parseInt(<string>req.params['id']);

        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        if (!id) {
          next(new ErrorResponse('Invoice not found', httpStatus.NOT_FOUND));
          return;
        }

        const soItems = await this.service.getActiveUsers(id, skip, limit);

        if (!soItems) {
          next(new ErrorResponse('Sales Orders not found', httpStatus.NOT_FOUND));
          return;
        }

        res.status(httpStatus.OK).json({
          success: true,
          data: soItems
        });
      }
    );
  }
}

export default new UserController(usersService);
