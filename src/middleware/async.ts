import { type NextFunction, type Request, type Response } from 'express';

const asyncHandler =
  (fn: (req: any, res: any, next: any) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) =>
    await Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
