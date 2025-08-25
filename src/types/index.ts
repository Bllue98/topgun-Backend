import type z from 'zod';
import type { Request } from 'express';
import type { loginSchema } from 'src/validations/auth.validation';
import type { DeepPartial } from 'utility-types';

export interface PaginationQuery {
  page: number | undefined;
  limit: number | undefined;
}

export type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>,
  Params = Record<string, unknown>
> = Request<Params, Record<string, unknown>, ReqBody, DeepPartial<QueryString>>;

export type UserLoginCredentials = z.infer<typeof loginSchema.shape.body>;
