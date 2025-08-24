import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ErrorResponse from './error';
import type { AnyZodObject, SafeParseError, ZodTypeAny } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * This function handles the validation of the given request validation schema.
 * It returns an HTTP response with status 400 BAD REQUEST if a validation error occurs,
 * or calls next if no error occurs.
 *
 * @param {RequestValidationSchema} schema - The schema object can contain optional body, query, and params keys, each with a Zod schema object.
 * @returns Returns an HTTP response or calls next if no error occurs.
 */
const validate = (schema: AnyZodObject | ZodTypeAny | undefined) => (req: Request, _res: Response, next: NextFunction) => {
  if (!schema) {
    next();
    return;
  }

  const parsed = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (parsed.success) {
    const { data } = parsed;
    req.body = data.body;
    req.query = data.query;
    req.params = data.params;
    next();
  }

  const { error } = parsed as SafeParseError<any>;
  if (error) {
    next(new ErrorResponse(fromZodError(error).message ?? 'Something went wrong..', httpStatus.BAD_REQUEST));
  }
};

export default validate;
