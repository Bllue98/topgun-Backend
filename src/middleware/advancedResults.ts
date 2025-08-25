import { type NextFunction, type Request, type Response } from 'express';
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';
import AdvancedResultsRepository from 'src/repositories/advancedTable.repository';

export type ApplyAccessFilters = (queryBuilder: SelectQueryBuilder<any>) => Promise<SelectQueryBuilder<any>>;

const advancedResults = <Entity extends ObjectLiteral>(
  entity: new () => Entity,
  additionalFilter = '',
  applyAccessFilters?: ApplyAccessFilters
) => {
  return async (
    req: Request<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, string>>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const repository = new AdvancedResultsRepository<Entity>(entity);

      const { data, total } = await repository.getAdvancedResults(req.query, additionalFilter, applyAccessFilters);

      res.status(200).json({
        success: true,
        data,
        total
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
};

export default advancedResults;
